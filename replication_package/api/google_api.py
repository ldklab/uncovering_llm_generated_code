"""
Install the Google AI Python SDK

$ pip install google-generativeai
"""

import os
import google.generativeai as genai

class GOOGLE_API:
    
    def __init__(self, model="gemini-1.5-flash", temperture=0.6, max_tokens=1024, top_k=None, top_p=None) -> None:
        
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
        
        self.model = model        
        self.generation_config = {
            "temperature": temperture, 
            "top_p": top_p, 
            "top_k": top_k, 
            "max_output_tokens": max_tokens,
            "response_mime_type": "text/plain",

        }
        
    def codeSnippetCleanup(self, input):
        # Remove any occurrences of backticks and "python" keyword
        language_delimiters = { "python": "```python", "javascript": "```javascript","html": "```html", "java": "```java", "bash": "```bash", "json": "```json", "css": "```css", "cpp": "```cpp", "c": "```c", "ruby": "```ruby", "go": "```go", "php": "```php", "sql": "```sql", "shell": "```shell", "xml": "```xml",
            }
        for language, delimiter in language_delimiters.items():
                if delimiter in input:
                    # Remove the language-specific code block delimiter
                    input = input.replace(delimiter, "")
            
        # Remove the common ending code block delimiter
        input = input.replace("```", "")
        return input.strip()
             
    
    def communication(self, prompt):
        model = genai.GenerativeModel(
            model_name = self.model, 
            generation_config = self.generation_config
        )
        
        chat_session = model.start_chat(
            history=[]
        )
        response = chat_session.send_message(prompt)
        
        # exit(response.text.strip())
        
        return response.text.strip()
    
    def communication_regen(self, prompt, n=1):
        model = genai.GenerativeModel(
            model_name = self.model, 
            generation_config = self.generation_config
        )
        chat_session = model.start_chat(
                history=[]
            )
        responses = []
        for _ in range(n):   
            response = chat_session.send_message(prompt)
            responses.append(response.text.strip())
                
        return responses