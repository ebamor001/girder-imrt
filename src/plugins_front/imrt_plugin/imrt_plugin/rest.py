from girder.api import access
from girder.api.rest import Resource
from girder.constants import AccessType
from girder_jobs.models.job import Job

def parse_bool(value, default=False):
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    return str(value).lower() in ("1", "true", "yes", "y", "on")

class ImrtPluginResource(Resource):
    def __init__(self):
        super().__init__()
        self.resourceName = "imrt_plugin"

        self.route("GET", ("job", ":jobId"), self.getJob)
        self.route("GET", ("jobs",), self.listJobs)
        self.route("POST", ("progress_test",), self.startProgressTest)

    @access.user(cookie=True)
    def getJob(self, jobId, params):
        user = self.getCurrentUser()

        job = Job().load(
            jobId,
            user=user,
            level=AccessType.READ
        )

        if job is None:
            raise Exception("Job not found")

        progress = job.get("progress") or {}
        current = progress.get("current", 0)
        total = progress.get("total", 1)

        percent = 0
        if total:
            percent = round((current / total) * 100, 2)

        return {
            "id": str(job["_id"]),
            "title": job.get("title"),
            "status": job.get("status"),
            "progress": progress,
            "progressPercent": percent,
            "progressMessage": progress.get("message", ""),
        }

    @access.user(cookie=True)
    def listJobs(self, params):
        user = self.getCurrentUser()

        jobs = list(
            Job().find(
                {
                    "userId": user["_id"],
                    "type": "imrt_progress_test",
                },
                sort=[("updated", -1)],
                limit=10,
            )
        )

        result = []

        for job in jobs:
            progress = job.get("progress") or {}
            current = progress.get("current", 0)
            total = progress.get("total", 1)

            percent = 0
            if total:
                percent = round((current / total) * 100, 2)

            result.append(
                {
                    "id": str(job["_id"]),
                    "title": job.get("title"),
                    "status": job.get("status"),
                    "progress": progress,
                    "progressPercent": percent,
                    "progressMessage": progress.get("message", ""),
                    "created": str(job.get("created")),
                    "updated": str(job.get("updated")),
                }
            )

        return result
    

    @access.user(cookie=True)
    def startProgressTest(self, params):
        user = self.getCurrentUser()
        n = int(params.get("n", 10))

        notify_email = parse_bool(params.get("notifyEmail"), default=False)
        # on peut forcer une adresse avec ?to=...
        to_email = params.get("to") or user.get("email")

        user_fullname = (
            f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
            or user.get("login", "Utilisateur")
        )

        
        job_model = Job()

        job = job_model.createJob(
            title="IMRT Progress Test Email",
            type="imrt_progress_test",
            handler="worker_handler",
            user=user,
            public=False,
            args=(n,),
            kwargs={},
            otherFields={
                "celeryTaskName": "imrt_worker.tasks.progressTest",
                "meta": {
                    "imrt": {
                        "enabled": True,
                        "notifyEmail": parse_bool(params.get("notifyEmail"), default=False),
                        "datasetName": "progress_test",
                        "processedFile": "progress_test",
                        "userFullName": user_fullname,
                        "userEmail": to_email,
                    }
                },
            },
        )

        job = job_model.save(job)
        job_model.scheduleJob(job)

        return {
            "jobId": str(job["_id"]),
            "title": job.get("title"),
            "status": job.get("status"),
            "progress": job.get("progress"),
            "meta": job.get("meta"),
        }