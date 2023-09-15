import { AxiosJob } from "@utils";

import { inscriptionsBFF } from "../api/repositories/inscriptions/inscriptions.instance";

export default [
  new AxiosJob({
    name: "prep-invitation",
    description:
      "Periodically send an event to check which bootcamp courses start and send the prep repository",
    cron: "0 17 * * *",
    path: "/cohorts/invite/prep",
    instance: inscriptionsBFF,
    method: "POST",
  }),
];
