import io.fabric8.kubernetes.client.*;
import io.fabric8.openshift.api.model.DeploymentConfig;
import io.fabric8.openshift.api.model.DeploymentConfigList;
import io.fabric8.openshift.client.OpenShiftAPIGroups;
import io.fabric8.openshift.client.OpenShiftClient;
import io.quarkiverse.mcp.server.Tool;
import io.quarkus.logging.Log;
import io.quarkus.runtime.configuration.ConfigBuilder;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;

public class OpenshiftTool {

    @Tool(description = "Get List of all openshift DeploymentConfigs")
    DeploymentConfigList getDeploymentConfigList() {
        DeploymentConfigList list = null;
        try (OpenShiftClient
                     client = new KubernetesClientBuilder().build().adapt(OpenShiftClient.class)) {
            if (!client.supportsOpenShiftAPIGroup(OpenShiftAPIGroups
                    .APPS)) {
                Log.warn("This cluster does not support the API Group {}");

            }
            list = client.deploymentConfigs().list();

            if (list == null) {
                Log.error("No list returned!");

            }
            List<DeploymentConfig> items = list.getItems();
            for (DeploymentConfig item : items) {
                Log.info("DeploymentConfig {} has version: {}");
            }

            if (!items.isEmpty()) {
                DeploymentConfig deploymentConfig = items.get(0);
                String name = deploymentConfig.getMetadata().getName();
                deploymentConfig = client.deploymentConfigs().withName(name).get();
                if (deploymentConfig == null) {
                    Log.error("No DeploymentConfig found for name ");

                }
                Log.info("get() DeploymentConfig {} has version: ");
            }

        } catch (KubernetesClientException e) {
            Log.error("Failed: {}", e.getMessage(), e);
        }
        return list;
    }

}
