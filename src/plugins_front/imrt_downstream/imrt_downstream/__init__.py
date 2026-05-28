import json
import logging
from pathlib import Path
from string import Template


from girder import events, plugin
from girder_jobs.constants import JobStatus
from girder.models.setting import Setting
from girder.settings import SettingKey
from girder.utility import mail_utils
from girder_jobs.models.job import Job
from girder_jobs.models.job import Job
from html import escape


logger = logging.getLogger(__name__)

PLUGIN_DIR = Path(__file__).parent
TEMPLATE_DIR = PLUGIN_DIR / "templates"
SETTINGS_FILE = PLUGIN_DIR / "settings.json"

FINAL_STATUSES = {
    JobStatus.SUCCESS,
    JobStatus.ERROR,
    JobStatus.CANCELED,
}


def read_mail_template(template_name: str) -> Template:
    template_path = TEMPLATE_DIR / template_name
    with open(template_path, "r", encoding="utf-8") as template_file:
        return Template(template_file.read())


def read_settings_json() -> dict:
    if not SETTINGS_FILE.exists():
        logger.warning("No downstream settings.json found at %s", SETTINGS_FILE)
        return {}

    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception:
        logger.exception("Failed to read downstream settings.json")
        return {}


def set_mail_settings():
    secrets = read_settings_json()

    if not secrets:
        logger.warning("SMTP settings not configured. Mail disabled.")
        return

    required_keys = [
        "SMTP_ENCRYPTION",
        "SMTP_HOST",
        "SMTP_PASSWORD",
        "SMTP_PORT",
        "SMTP_USERNAME",
    ]

    missing = [key for key in required_keys if key not in secrets]

    if missing:
        logger.warning("Missing SMTP settings: %s", missing)
        return

    setting = Setting()
    setting.set(SettingKey.SMTP_ENCRYPTION, secrets["SMTP_ENCRYPTION"])
    setting.set(SettingKey.SMTP_HOST, secrets["SMTP_HOST"])
    setting.set(SettingKey.SMTP_PASSWORD, secrets["SMTP_PASSWORD"])
    setting.set(SettingKey.SMTP_PORT, secrets["SMTP_PORT"])
    setting.set(SettingKey.SMTP_USERNAME, secrets["SMTP_USERNAME"])

    logger.info("SMTP settings loaded for IMRT downstream")


def status_label(status: int) -> str:
    if status == JobStatus.INACTIVE:
        return "INACTIVE"
    if status == JobStatus.QUEUED:
        return "QUEUED"
    if status == JobStatus.RUNNING:
        return "RUNNING"
    if status == JobStatus.SUCCESS:
        return "SUCCESS"
    if status == JobStatus.ERROR:
        return "ERROR"
    if status == JobStatus.CANCELED:
        return "CANCELED"

    return str(status)


def mail_template_for_status(status: int) -> str:
    if status == JobStatus.SUCCESS:
        return "success_template.txt"
    if status == JobStatus.ERROR:
        return "error_template.txt"
    if status == JobStatus.CANCELED:
        return "canceled_template.txt"
    return "default_template.txt"


def get_imrt_meta(job: dict) -> dict:
    meta = job.get("meta") or {}
    imrt_meta = meta.get("imrt") or {}
    return imrt_meta


def should_handle_job(job):
    imrt_meta = (job.get("meta") or {}).get("imrt") or {}
    return imrt_meta.get("enabled") is True


def should_send_email(job):
    imrt_meta = (job.get("meta") or {}).get("imrt") or {}
    if imrt_meta.get("emailSent") is True:
        return False

    return imrt_meta.get("notifyEmail") is True

def send_job_mail(job: dict):
    try:
        imrt_meta = get_imrt_meta(job)
        if imrt_meta.get("emailSent") is True:
            logger.info("Email already sent for job %s", job.get("_id"))
            return

        user_email = imrt_meta.get("userEmail", "")
        user_fullname = imrt_meta.get("userFullName", "")
        processed_file = imrt_meta.get("processedFile", "")
        dataset_name = imrt_meta.get("datasetName", "IMRT dataset")

        if not isinstance(user_email, str) or not user_email:
            logger.warning("No valid userEmail in job meta. Mail skipped.")
            return

        if not mail_utils.validateEmailAddress(user_email):
            logger.warning("Invalid email %s. Mail skipped.", user_email)
            return

        status = job.get("status")
        template_name = mail_template_for_status(status)
        template = read_mail_template(template_name)

        created = job.get("created")
        updated = job.get("updated")

        start_hour = created.strftime("%H:%M:%S") if created else ""
        end_hour = updated.strftime("%H:%M:%S") if updated else ""

        message = template.substitute(
            PERSON_NAME=user_fullname or "Utilisateur",
            JOB_NAME=job.get("title", "IMRT job"),
            START_HOUR=start_hour,
            END_HOUR=end_hour,
            PROCESSED_FILE=processed_file,
        )

        # Normalise les retours à la ligne
        message = message.replace("\r\n", "\n").replace("\r", "\n")

        # Girder/Gmail interprète le contenu comme HTML,
        # donc on échappe le texte puis on transforme les retours ligne en <br>
        html_message = escape(message).replace("\n", "<br>\n")

        subject = f"IMRT Notification - {status_label(status)} - {dataset_name}"

        mail_utils.sendMail(
            subject=subject,
            text=html_message,
            to=user_email,
        )

        # Évite l'envoi du mail deux fois si l'événement SUCCESS est déclenché deux fois
        job.setdefault("meta", {}).setdefault("imrt", {})["emailSent"] = True
        Job().save(job)

        logger.info("Mail sent to %s for job %s", user_email, job.get("_id"))

        job.setdefault("meta", {}).setdefault("imrt", {})["emailSent"] = True
        Job().save(job)

        logger.info("Mail sent to %s for job %s", user_email, job.get("_id"))

    except Exception:
        logger.exception("Mail sending failed for job %s", job.get("_id"))
        return


def validate_job_status(event):
    try:
        job = event.info.get("job")

        if not job:
            return

        if not should_handle_job(job):
            return

        status = job.get("status")

        logger.info(
            "IMRT downstream: job=%s title=%s status=%s progress=%s",
            job.get("_id"),
            job.get("title"),
            status_label(status),
            job.get("progress") or {},
        )

        if status not in FINAL_STATUSES:
            return

        if should_send_email(job):
            send_job_mail(job)
        else:
            logger.info("Email notification disabled for job %s", job.get("_id"))

    except Exception:
        logger.exception("IMRT downstream handler failed")
        return


class ImrtDownstreamPlugin(plugin.GirderPlugin):
    DISPLAY_NAME = "IMRT Downstream"

    def load(self, info):
        print("############################")
        print("Loading IMRT Downstream")
        print("############################")

        set_mail_settings()

        events.bind(
            "jobs.job.update.after",
            "imrt_downstream_job_update",
            validate_job_status,
        )