import { Application } from "@feathersjs/feathers";
export default function feathersHelper(): {
    init: () => Application;
};
