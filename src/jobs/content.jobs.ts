import { AxiosJob } from "@utils";

import { inscriptionsBFF } from "../api/repositories/inscriptions/inscriptions.instance";

export default [
  new AxiosJob({
    name: "content-roles",
    description:
      "Periodically send an event to check which bootcamp starts and assign the corresponding content roles",
    cron: "0 16 * * *",
    path: "/cohorts/roles",
    instance: inscriptionsBFF,
    method: "PUT",
  }),
];
