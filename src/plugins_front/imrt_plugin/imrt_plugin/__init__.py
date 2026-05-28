from girder import plugin
from .rest import ImrtPluginResource


class ImrtPlugin(plugin.GirderPlugin):
    DISPLAY_NAME = "IMRT Plugin"

    def load(self, info):
        print("############################")
        print("Loading IMRT Plugin")
        print("############################")

        info["apiRoot"].imrt_plugin = ImrtPluginResource()

    