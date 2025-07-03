#as admin

oc apply -f ../helm/quarkus-openshift-mcp/templates/serviceaccount.yaml -n llama-stack-mcp-demo

oc adm policy add-role-to-user view -z quarkus-openshift-mcp-sa -n llama-stack-mcp-demo

oc set serviceaccount deployments/quarkus-openshift-mcp quarkus-openshift-mcp-sa -n llama-stack-mcp-demo

oc adm policy add-cluster-role-to-user cluster-admin -z quarkus-openshift-mcp-sa