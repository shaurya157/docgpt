import {Button} from "@/components/plate-ui/button";

const templates = [
  {
    name: "Uber PRD template",
    template: `\
   # Title
   ## Overview
   ## User stories
   ## Launch plan
   ## Conclusion
  `
  },

]

export function TemplateItems() {
  return(
    <div>
      <p>Pick one of these popular templates to help you generate your first doc</p>
      {
        templates.map((templ) => {
          return <div key={templ["name"]}>
            {templ["name"]}
            <Button>View Template</Button>
          </div>
        })
      }
    </div>
  )
}
