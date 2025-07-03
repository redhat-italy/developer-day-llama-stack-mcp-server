import io.fabric8.openshift.api.model.DeploymentConfigList;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/info")
public class OpenshiftInfoResource {
    @Inject
    OpenshiftTool ocptool;

    @GET()
    @Path("/cluster")
   public  DeploymentConfigList getList(){
        return ocptool.getDeploymentConfigList();
    }
}
