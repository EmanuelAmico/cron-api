import { AxiosJob } from "@utils";

import { inscriptionsAPI } from "../api/repositories/inscriptions/inscriptions.instance";

export default [
  new AxiosJob({
    name: "prep-invitation",
    description:
      "Periodically send an event to check which bootcamp courses start and send the prep repository",
    cron: "0 0 * * *",
    url: "/cohorts/invite/prep",
    instance: inscriptionsAPI,
    method: "POST",
  }),
];
