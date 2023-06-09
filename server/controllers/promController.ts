import { MiddlewareFn, PodMetric, stausObject, podObject } from '../types';
import axios from 'axios';

const PROM_IP = 'prometheus.monitoring-kv.svc.cluster.local';
const PROM_NODE_PORT = '8080';

const getPodNames: MiddlewareFn = async (req, res, next) => {
  try {
    const response = await axios.get(
      `http://${PROM_IP}:${PROM_NODE_PORT}/api/v1/query?query=kube_pod_info`
    );

    const podMetrics = response.data.data.result as PodMetric[];
    const podNames: { name: string; ip: string }[] = podMetrics.map((item) => {
      return { name: item.metric.pod, ip: item.metric.pod_ip };
    });

    res.locals.names = podNames;
    return next();
  } catch (err) {
    next(err);
  }
};

const getpodIP: MiddlewareFn = async (req, res, next) => {
  try {
    const response = await axios.get(
      `http://${PROM_IP}:${PROM_NODE_PORT}/api/v1/query?query=kube_pod_info`
    );

    const podMetrics = response.data.data.result as PodMetric[];
    const podIPs: string[] = podMetrics.map((item) => item.metric.pod_ip);

    res.locals.podIPs = podIPs;
    return next();
  } catch (err) {
    next(err);
  }
};

const getPodStatuses: MiddlewareFn = async (req, res, next) => {
  try {
    const response = await axios.get(
      `http://${PROM_IP}:${PROM_NODE_PORT}/api/v1/query?query=kube_pod_status_phase`
    );
    const podStatusInfo = response.data.data.result;

    const podStatusNames = {};

    podStatusInfo.forEach((el: stausObject) => {
      if (el.value[1] === '1') {
        if (!podStatusNames[el.metric.pod]) {
          podStatusNames[el.metric.pod] = el.metric.phase;
        }
      }
    });

    res.locals.podStatusNames = podStatusNames;
    return next();
  } catch (error) {}
};

//controller seperates information under two categories
//podNodes returns name of the nodes and corresponding pods
//nodeGraphInfo return more data on pods for NodeGraph
const getPodNodes: MiddlewareFn = async (req, res, next) => {
  try {
    const response = await axios.get(
      `http://${PROM_IP}:${PROM_NODE_PORT}/api/v1/query?query=kube_pod_info`
    );
    const pods = response.data.data.result;
    const podNodes = pods.reduce(
      (acc: { [key: string]: string[] }, curr: podObject) => {
        if (acc[curr.metric.node]) {
          acc[curr.metric.node].push(curr.metric.pod);
        } else {
          acc[curr.metric.node] = [curr.metric.pod];
        }
        return acc;
      },
      {}
    );
    let nodeGraphInfo = {};
    pods.forEach((el: podObject) => {
      nodeGraphInfo[el.metric.pod] = {};
      nodeGraphInfo[el.metric.pod]['hostIp'] = el.metric['host_ip'];
      nodeGraphInfo[el.metric.pod].podIp = el.metric['pod_ip'];
      nodeGraphInfo[el.metric.pod].node = el.metric.node;
      nodeGraphInfo[el.metric.pod].nameSpace = el.metric.namespace;
      nodeGraphInfo[el.metric.pod].job = el.metric.job;
    });
    let result = {
      podNodes: podNodes,
      nodeGraph: nodeGraphInfo
    };
    res.locals.result = result;
    return next();
  } catch (error) {}
};
export default { getPodNames, getpodIP, getPodStatuses, getPodNodes };
