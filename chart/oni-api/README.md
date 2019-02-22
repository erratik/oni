https://docs.helm.sh/developing_charts/

- parent directory == chart name
- structure:
```wordpress/
  Chart.yaml          # A YAML file containing information about the chart
  LICENSE             # OPTIONAL: A plain text file containing the license for the chart
  README.md           # OPTIONAL: A human-readable README file
  requirements.yaml   # OPTIONAL: A YAML file listing dependencies for the chart
  values.yaml         # The default configuration values for this chart
  charts/             # A directory containing any charts upon which this chart depends.
  templates/          # A directory of templates that, when combined with values,
                      # will generate valid Kubernetes manifest files.
  templates/NOTES.txt # OPTIONAL: A plain text file containing short usage notes
  ```


- the values file can be ovveriden using the `--values=` parameter. The values are merged together.
- debug: `helm install --debug --dry-run oni/`

- updates: use `helm upgrade --reset-values <release> <chart>`. releases are environment agnostic ?
- namespaces for envs + prod cluster
- review apps in namespace + ref in release name 
- overide IngressDomain
