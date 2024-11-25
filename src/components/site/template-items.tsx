import {Button} from "@/components/plate-ui/button";
import {useUserSettings} from "@/providers/UserSettingsProvider";
import {toast} from "sonner";

const templates = [
  {
    name: "Uber PRD template",
    template: `\
    <Template>
   # Title
   ## Metadata
   <SectionInstruction>Should be a list of points. One point for author, one point for prct url, one for project summary, one for date started </SectionInstruction>
   ## PROBLEM DEFINITION
   ### Objectives
   ### Context, Problems, Opportunities
   ### Hypothesis & Risks
   ## PRODUCT DEFINITION
   ### Requirements
   ### Designs
   ### Data Requirements
   ### Support Requirements
   ### Other Product Teams Impacted
   </Template>
  `
  },
  {
    name: "Amazon PRD template",
    template: `\
    <Template>
   # Title
   ## Overview
   <SectionInstruction>A brief overview of the idea. A minimum of 5 lines should be written</SectionInstruction>
   ## Success Metrics
   <SectionInstruction>Propose 3 metrics at minimum to measure success of the idea</SectionInstruction>
   ## Conclusion
   </Template>
  `
  },
]

const defaultTemplate = {
  name: "Default template",
  template: `\
    <Template>
   # Title
   ## Overview
   <SectionInstruction>A brief overview of the idea. A minimum of 5 lines should be written</SectionInstruction>
   ## Conclusion
   <SectionInstruction>A brief conclusion summarizing the document. A minimum of 5 lines should be written</SectionInstruction>
   </Template>
  `
}

export function TemplateItems() {
  const { template, setTemplate } = useUserSettings()

  const handleSelect = (template) => {
    return () => {
      setTemplate?.(template)
      toast.info(`Using ${template.name} to generate docs.`)
    }
  }

  return(
    <div>
      <p>Pick one of these popular templates to help you generate your first doc</p>
      {
        templates.map((templ) => {
          return <div key={templ.name}>
            {templ["name"]}
            <Button onClick={handleSelect(templ)}>Use Template</Button>
          </div>
        })
      }
      <Button onClick={handleSelect(defaultTemplate)}>Reset to default</Button>
    </div>
  )
}
