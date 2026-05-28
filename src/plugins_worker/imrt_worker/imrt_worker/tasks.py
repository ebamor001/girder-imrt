import time

from girder_worker.app import app
from girder_jobs.constants import JobStatus


@app.task(bind=True, name="imrt_worker.tasks.progressTest")
def progressTest(self, n=10):
    n = int(n)

    print("############################")
    print("IMRT WORKER - progressTest")
    print(f"n = {n}")
    print("############################")

    self.job_manager.updateStatus(JobStatus.RUNNING)
    self.job_manager.updateProgress(
        total=n,
        current=0,
        message="Starting"
    )

    for i in range(n):
        current = i + 1
        percent = round((current / n) * 100, 2)

        print(f"Step {current}/{n} - {percent}%")

        self.job_manager.updateProgress(
            total=n,
            current=current,
            message=f"Step {current}/{n}"
        )

        time.sleep(1)

    self.job_manager.updateProgress(
        total=n,
        current=n,
        message="Done"
    )

    self.job_manager.updateStatus(JobStatus.SUCCESS)

    return {
        "status": "done",
        "message": f"ProgressTest finished with n={n}",
    }