import { createPlugin, useDocument, useConfig } from '@loomity/core';
import { Button, Tooltip, Dialog } from '@loomity/ui';
import { Wand2 } from 'lucide-react';

const AIAssistant = () => {
  const { document, updateDocument } = useDocument();
  const config = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const generateSuggestion = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: document.content,
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        }),
      });
      
      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
    } finally {
      setGenerating(false);
    }
  };

  const applySuggestion = () => {
    updateDocument({ content: suggestion });
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip content="Get AI suggestions">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          disabled={generating}
        >
          <Wand2 className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>AI Suggestions</Dialog.Title>
            <Dialog.Description>
              Let AI help you improve your document
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-4">
            {generating ? (
              <div className="flex items-center justify-center p-4">
                <span className="loading loading-spinner" />
                <span className="ml-2">Generating suggestions...</span>
              </div>
            ) : suggestion ? (
              <>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Suggested Changes:</h3>
                  <p>{suggestion}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={applySuggestion}>
                    Apply Changes
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <Button onClick={generateSuggestion}>
                  Generate Suggestions
                </Button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default createPlugin({
  id: 'ai-assistant',
  name: 'AI Assistant',
  toolbar: AIAssistant,
});
