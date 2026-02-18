import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { File, Folder, Files } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...defaultComponents,
        // Tabs for package manager options
        Tab,
        Tabs,
        // Accordion for collapsible content
        Accordion,
        Accordions,
        // File tree display
        File,
        Folder,
        Files,
        // Step-by-step guides
        Step,
        Steps,
        // Callout for info/warning boxes
        Callout,
        ...components,
    };
}
