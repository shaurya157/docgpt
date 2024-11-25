import {Button} from "@/components/plate-ui/button";
import {useUserSettings} from "@/providers/UserSettingsProvider";

const templates = [
  {
    name: "Uber PRD template",
    template: `\
    <Template>
   # Title
   ## Overview
   ## User stories
   ## Launch plan
   ## Conclusion
   </Template>
  `
  },
]

export function TemplateItems() {
  const { template, setTemplate } = useUserSettings()

  const handleSelect = (template: string) => {
    return () => {
      setTemplate?.(template)
    }
  }

  return(
    <div>
      <p>Pick one of these popular templates to help you generate your first doc</p>
      {
        templates.map((templ) => {
          return <div key={templ.name}>
            {templ["name"]}
            <Button>View Template</Button>
            <Button onClick={handleSelect(templ.template)}>Use Template</Button>
          </div>
        })
      }
    </div>
  )
}
