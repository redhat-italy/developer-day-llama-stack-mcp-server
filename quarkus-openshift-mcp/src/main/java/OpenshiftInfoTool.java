import io.fabric8.kubernetes.client.*;
import io.fabric8.openshift.api.model.DeploymentConfig;
import io.fabric8.openshift.api.model.DeploymentConfigList;
import io.fabric8.openshift.client.OpenShiftAPIGroups;
import io.fabric8.openshift.client.OpenShiftClient;
import io.quarkiverse.mcp.server.Tool;
import io.quarkus.logging.Log;

import io.quarkus.logging.Log;

public class OpenshiftInfoTool {
    @Tool(description = "Get current Openshift cluster informations" )
    String getOpenshiftClusterInfo(){
        String openShiftVersionInfo=null;
        try (OpenShiftClient
                     client = new KubernetesClientBuilder().build().adapt(OpenShiftClient.class)) {
            openShiftVersionInfo = client.getOpenShiftV4Version();

            Log.info("Version details of this OpenShift cluster :-");

       /*     Log.info("Major        : {}"+ openShiftVersionInfo.getMajor());
            Log.info("Minor        : {}"+ openShiftVersionInfo.getMinor());
            Log.info("GitVersion   : {}"+ openShiftVersionInfo.getGitVersion());
            Log.info("BuildDate    : {}"+ openShiftVersionInfo.getBuildDate());
            Log.info("GitTreeState : {}"+ openShiftVersionInfo.getGitTreeState());
            Log.info("Platform     : {}"+ openShiftVersionInfo.getPlatform());
            Log.info("GitVersion   : {}"+ openShiftVersionInfo.getGitVersion());
            Log.info("GoVersion    : {}"+ openShiftVersionInfo.getGoVersion());
            Log.info("GitCommit    : {}"+ openShiftVersionInfo.getGitCommit());*/
        } catch (KubernetesClientException e) {
            Log.error("Failed: {}", e.getMessage(), e);
        }
        return openShiftVersionInfo;
    }
}
