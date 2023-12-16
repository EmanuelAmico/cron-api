import { AxiosJob } from "@utils";

import { CohortStatus, CourseTags } from "@types";
import { inscriptionsBFF } from "../api/repositories/inscriptions/inscriptions.instance";

export default [
  new AxiosJob({
    name: "content-roles",
    description:
      "Periodically send an event to check which bootcamp starts and assign the corresponding content roles",
    cron: "0 17 * * *",
    path: "/cohorts/roles",
    instance: inscriptionsBFF,
    method: "PUT",
  }),
  new AxiosJob({
    name: "intro-completion-email",
    description:
      "Periodically check which full stack intro ended and send the corresponding email",
    cron: "0 0 * * *",
    path: "/cohorts/emails",
    body: { phase: CohortStatus.STARTED, tag: CourseTags.INTRO_JAVASCRIPT },
    instance: inscriptionsBFF,
    method: "POST",
  }),
];
