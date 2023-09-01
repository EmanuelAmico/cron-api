import { AxiosJob } from "@utils";

import { inscriptionsAPI } from "../api/repositories/inscriptions/inscriptions.instance";

export default [
  new AxiosJob({
    name: "content-roles",
    description:
      "Periodically send an event to check which bootcamp starts and assign the corresponding content roles",
    cron: "0 0 * * *",
    url: "/cohorts/roles",
    instance: inscriptionsAPI,
    method: "PUT",
  }),
  new AxiosJob({
    name: "intro-completion-email",
    description:
      "Periodically check which full stack intro ended and send the corresponding email",
    cron: "0 0 * * *",
    url: "/cohorts/emails/intro/end",
    instance: inscriptionsAPI,
    method: "POST",
  }),
];
