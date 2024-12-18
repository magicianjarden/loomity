// Code Formatter Plugin

class CodeFormatterPlugin {
  constructor(api) {
    this.api = api;
    this.settings = api.settings;
    this.prettier = require('prettier');
  }

  async onLoad() {
    // Register commands
    this.api.commands.register('format.document', this.formatDocument.bind(this));
    
    // Add menu items
    this.api.ui.addMenuItem({
      id: 'format-document',
      label: 'Format Document',
      command: 'format.document',
      keybinding: 'Cmd+Shift+F'
    });

    // Register format on save if enabled
    if (this.settings.get('formatOnSave')) {
      this.api.editor.onWillSave(this.formatDocument.bind(this));
    }

    // Log successful load
    this.api.logger.info('Code Formatter Plugin loaded successfully');
  }

  async formatDocument() {
    try {
      const editor = this.api.editor.active;
      if (!editor) return;

      const text = editor.getText();
      const language = editor.getLanguage();

      // Emit start event
      this.api.events.emit('format:start', { language });

      // Format the code
      const formatted = await this.prettier.format(text, {
        parser: this.getParserForLanguage(language),
        tabWidth: this.settings.get('indentSize'),
        printWidth: this.settings.get('printWidth')
      });

      // Apply the formatting
      editor.setText(formatted);

      // Save format history
      await this.api.db.collection('formatHistory').add({
        timestamp: new Date(),
        language,
        fileSize: text.length,
        duration: performance.now()
      });

      // Emit completion event
      this.api.events.emit('format:complete', { language });

      // Show success notification
      this.api.ui.showNotification({
        type: 'success',
        message: 'Document formatted successfully'
      });
    } catch (error) {
      // Emit error event
      this.api.events.emit('format:error', { error });

      // Show error notification
      this.api.ui.showNotification({
        type: 'error',
        message: 'Failed to format document: ' + error.message
      });

      // Log error
      this.api.logger.error('Format error:', error);
    }
  }

  getParserForLanguage(language) {
    const parserMap = {
      'javascript': 'babel',
      'typescript': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown'
    };
    return parserMap[language] || 'babel';
  }

  onUnload() {
    // Cleanup
    this.api.commands.unregister('format.document');
    this.api.logger.info('Code Formatter Plugin unloaded');
  }
}

module.exports = CodeFormatterPlugin;
