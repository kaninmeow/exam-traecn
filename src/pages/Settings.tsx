import { useState } from 'react';
import { Settings as SettingsIcon, Key, Globe, Cpu, Moon, Sun, Trash2, Save, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useSettingsStore } from '@/stores/settingsStore';
import { STORAGE_KEYS } from '@/constants';

export default function Settings() {
  const { settings, updateSettings, toggleDarkMode } = useSettingsStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);
  const [model, setModel] = useState(settings.model);
  const [saved, setSaved] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const handleSave = () => {
    updateSettings({ apiKey, apiBaseUrl, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('exam_'));
    keys.forEach((k) => localStorage.removeItem(k));
    setClearModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-base font-semibold text-gray-800">设置</h2>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Key size={16} className="text-amber-500" />
          API 配置
        </h3>
        <Input
          label="API Key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
        />
        <Input
          label="API Base URL"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
        <Input
          label="模型"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gpt-3.5-turbo"
        />
        <Button onClick={handleSave} className="w-full">
          {saved ? (
            <><CheckCircle2 size={16} className="mr-1.5" />已保存</>
          ) : (
            <><Save size={16} className="mr-1.5" />保存设置</>
          )}
        </Button>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <SettingsIcon size={16} className="text-gray-500" />
          通用设置
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.darkMode ? <Moon size={16} className="text-gray-600" /> : <Sun size={16} className="text-amber-500" />}
            <span className="text-sm text-gray-700">深色模式</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${settings.darkMode ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200 ${settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Trash2 size={16} className="text-red-500" />
          数据管理
        </h3>
        <p className="text-xs text-gray-500">清除所有本地数据，包括上传记录、学习记录、题目等。</p>
        <Button variant="danger" size="sm" onClick={() => setClearModalOpen(true)}>
          清除所有数据
        </Button>
      </Card>

      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)} title="确认清除数据">
        <p className="text-sm text-gray-600 mb-4">此操作不可恢复，将清除所有本地数据。确定要继续吗？</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setClearModalOpen(false)}>取消</Button>
          <Button variant="danger" onClick={handleClearData}>确认清除</Button>
        </div>
      </Modal>
    </div>
  );
}
