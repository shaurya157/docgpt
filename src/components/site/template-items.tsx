import {Button} from "@/components/plate-ui/button";
import {useTemplate} from "@/providers/TemplateProvider";
import {toast} from "sonner";
import {useUserDataContext} from "@/providers/UserDataContextProvider";
import Link from "next/link";

// const templates = [
//   {
//     name: "Uber PRD template",
//     template: `\
//     <Template>
//    # Title \\n\\n
//    ## Metadata \\n
//    <SectionInstruction>Should be a list of points. One point for author, one point for prct url, one for project summary, one for date started </SectionInstruction> \\n\\n
//    ## PROBLEM DEFINITION \\n\\n
//    ### Objectives \\n\\n
//    ### Context, Problems, Opportunities \\n\\n
//    ### Hypothesis & Risks \\n\\n
//    ## PRODUCT DEFINITION \\n\\n
//    ### Requirements \\n\\n
//    ### Designs \\n\\n
//    ### Data Requirements \\n\\n
//    ### Support Requirements \\n\\n
//    ### Other Product Teams Impacted \\n\\n
//    </Template>
//   `
//   }
// ]

const defaultTemplate = {
  name: "Default template",
  template: `
    <Template>
   # Title \\n\\n
   ## Overview \\n
   <SectionInstruction>A brief overview of the idea. A minimum of 5 lines should be written</SectionInstruction> \\n\\n
   ## Conclusion \\n
   <SectionInstruction>A brief conclusion summarizing the document. A minimum of 5 lines should be written</SectionInstruction> \\n\\n
   </Template>
  `
}

export function TemplateItems() {
  const { userTemplates } = useUserDataContext()
  const { providedTemplates, setActiveTemplate } = useTemplate()

  const handleSelect = (template) => {
    return () => {
      setActiveTemplate?.(template)
      toast.info(`Using ${template["templateName"]} to generate docs.`)
    }
  }

  return(
    <div>
      <p>Pick one of these popular templates to help you generate your first doc</p>
      {
        providedTemplates?.map((templ, idx) => {
          return <div key={"provided-templates-" + templ["templateName"] + idx}>
            {templ["templateName"]}
            <Button onClick={handleSelect(templ)}>Use Template</Button>
            <Button>
              <Link href={`/templates/${templ["templateName"]}`} target="_blank">View Template</Link>
            </Button>
          </div>
        })
      }
      <p>Or pick one of your own</p>
      {
        userTemplates?.map((templ, idx) => {
          return <div key={"user-templates-" + templ["templateName"] + idx}>
            {templ["templateName"]}
            <Button onClick={handleSelect(templ)}>Use Template</Button>
            <Button>
              <Link href={`/templates/${templ["templateName"]}`} target="_blank">View Template</Link>
            </Button>
          </div>
        })
      }
      <Button>
        <Link href={`/templates/create`} target="_blank">Create New Template</Link></Button>
    </div>
  )
}
