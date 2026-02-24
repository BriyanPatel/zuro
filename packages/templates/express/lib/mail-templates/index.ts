import { welcome } from "./welcome";

type TemplateFn = (data: Record<string, unknown>) => string;

export const templates: Record<string, TemplateFn> = {
    welcome,
};
