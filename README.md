# to-kube-list

This repository contains a full-stack to-do list application that uses the Kubernetes API server for its backend. Why? Read my blog post about it (coming soon).

## Running the application

The stack runs using a docker compose stack. To start it, run `docker compose up`.

Once the stack is running, you can access the application at http://localhost:8080.

To stop the stack, run `docker compose down`.

To persist application data, uncomment the `etcd-data` volume declaration, and the volume mount in the etcd service.

## Extra details about the docker compose stack

The stack is composed of the following services:

| Service | Description | Network |
| ------- | ----------- | ------- |
| `kube-apiserver` | A Kubernetes API server that is configured to use etcd as its backend | Internal Bridge |
| `etcd` | A single-node etcd cluster to be used by the kube-apiserver | Internal Bridge |
| `webserver` | An nginx webserver that serves the static files for the frontend. This server also proxies requests to the backend API server over the internal network bridge. | Internal Bridge, Host Port `8080` |
| `bootstrap-certs` | Runs scripts to generate the TLS certificates needed for the Kubernetes API server and stores them to the `key-files` volume. | Internal Bridge |
| `bootstrap-apiserver` | Runs scripts to apply CRDs to the API server. | Internal Bridge |