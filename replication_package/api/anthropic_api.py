"""
Install the Anthropic AI Python SDK

$ pip install anthropic
"""

import anthropic
import os

class ANTHROPIC_API:
    
    def __init__(self, model="claude-3-5-sonnet-20240620",  temperature=0.6, max_tokens=1024, system_prompt=None, stop_sequences=[], stream=None, tools=[], top_k=None, top_p=None) -> None:
        
        self.client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.stop_sequences = stop_sequences
        self.stream = stream
        self.tools = tools
        self.top_k = top_k
        self.top_p = top_p
        self.system_prompt = system_prompt or "You are a highly capable assistant. Provide clear, accurate, and concise responses to any task or question."
        
        
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
        
    def communication(self, prompt="hello world"):
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            stop_sequences = self.stop_sequences,
            tools = self.tools,
            system=self.system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        return response.content[0].text.strip() 
    
    def communication_regen(self, prompt="hello world", n=1):
        responses = []
        for _ in range(n):
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stop_sequences = self.stop_sequences,
                tools = self.tools,
                system=self.system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            responses.append(response.content[0].text.strip() )
        return responses
    
    def communication_multiple(self, messages_list):
        """
            messages_list: [
                {"role": "<ROLE>", "content": "<CONTENT-PROMPT>"}, 
                .
                .
                .
            ]
        """
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            stop_sequences = self.stop_sequences,
            tools = self.tools,
            messages=messages_list
            )
        
        return response["choices"][0]["message"]["content"]  