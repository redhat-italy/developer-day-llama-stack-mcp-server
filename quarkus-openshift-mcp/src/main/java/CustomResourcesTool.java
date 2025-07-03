
import io.fabric8.kubernetes.api.model.apiextensions.v1beta1.CustomResourceDefinition;
import io.fabric8.kubernetes.api.model.apiextensions.v1beta1.CustomResourceDefinitionList;
import io.fabric8.kubernetes.client.*;
import io.fabric8.openshift.api.model.DeploymentConfig;
import io.fabric8.openshift.api.model.DeploymentConfigList;
import io.fabric8.openshift.client.OpenShiftAPIGroups;
import io.fabric8.openshift.client.OpenShiftClient;
import io.quarkiverse.mcp.server.Tool;
import io.quarkus.logging.Log;

import java.util.ArrayList;
import java.util.List;

public class CustomResourcesTool {
    @Tool(description = "Get custom resources definitions (crd) information" )
    public List<CrdInfo> getCrdInfo(String namespace) {
        List<CrdInfo> crdInfoList = new ArrayList<>();
        try (OpenShiftClient client = new KubernetesClientBuilder().build().adapt(OpenShiftClient.class)) {
            if (!client.supports(CustomResourceDefinition.class)
                    && !client.supports(io.fabric8.kubernetes.api.model.apiextensions.v1.CustomResourceDefinition.class)) {
                System.out.println("WARNING this cluster does not support the API Group apiextensions.k8s.io");
                return null;
            }

            CustomResourceDefinitionList list = client.apiextensions().v1beta1().customResourceDefinitions().list();
            if (list == null) {
                System.out.println("ERROR no list returned!");
                return null;
            }
            List<CustomResourceDefinition> items = list.getItems();
            for (CustomResourceDefinition item : items) {
                System.out
                        .println("CustomResourceDefinition " + item.getMetadata().getName() + " has version: " + item.getApiVersion());

                CrdInfo info = new CrdInfo();
                info.name = item.getMetadata().getName();
                info.version = item.getMetadata().getResourceVersion();
                crdInfoList.add(info);
            }
        } catch (KubernetesClientException e) {
            System.out.println("Failed: " + e);
            e.printStackTrace();
        }
        return crdInfoList;
    }
}

