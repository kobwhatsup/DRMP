import { message as antdMessage } from 'antd';
import type { MessageArgsProps } from 'antd';

// 配置全局消息默认设置
const DEFAULT_DURATION = 3; // 3秒后自动关闭
const DEFAULT_MAX_COUNT = 3; // 最多同时显示3条消息

// 配置全局消息
antdMessage.config({
  duration: DEFAULT_DURATION,
  maxCount: DEFAULT_MAX_COUNT,
  top: 100, // 距离顶部100px
});

// 创建消息工具类
class MessageUtil {
  private static messageKeys = new Set<string>();

  // 成功消息
  static success(content: string, duration?: number, key?: string) {
    const msgKey = key || `success-${Date.now()}`;
    
    // 如果使用了key，先销毁相同key的消息
    if (key && this.messageKeys.has(key)) {
      antdMessage.destroy(key);
    }
    
    this.messageKeys.add(msgKey);
    
    antdMessage.success({
      content,
      duration: duration ?? DEFAULT_DURATION,
      key: msgKey,
      onClose: () => {
        this.messageKeys.delete(msgKey);
      }
    });
  }

  // 错误消息
  static error(content: string, duration?: number, key?: string) {
    const msgKey = key || `error-${Date.now()}`;
    
    if (key && this.messageKeys.has(key)) {
      antdMessage.destroy(key);
    }
    
    this.messageKeys.add(msgKey);
    
    antdMessage.error({
      content,
      duration: duration ?? DEFAULT_DURATION,
      key: msgKey,
      onClose: () => {
        this.messageKeys.delete(msgKey);
      }
    });
  }

  // 信息消息
  static info(content: string, duration?: number, key?: string) {
    const msgKey = key || `info-${Date.now()}`;
    
    if (key && this.messageKeys.has(key)) {
      antdMessage.destroy(key);
    }
    
    this.messageKeys.add(msgKey);
    
    antdMessage.info({
      content,
      duration: duration ?? DEFAULT_DURATION,
      key: msgKey,
      onClose: () => {
        this.messageKeys.delete(msgKey);
      }
    });
  }

  // 警告消息
  static warning(content: string, duration?: number, key?: string) {
    const msgKey = key || `warning-${Date.now()}`;
    
    if (key && this.messageKeys.has(key)) {
      antdMessage.destroy(key);
    }
    
    this.messageKeys.add(msgKey);
    
    antdMessage.warning({
      content,
      duration: duration ?? DEFAULT_DURATION,
      key: msgKey,
      onClose: () => {
        this.messageKeys.delete(msgKey);
      }
    });
  }

  // 加载消息
  static loading(content: string, duration?: number, key?: string): () => void {
    const msgKey = key || `loading-${Date.now()}`;
    
    if (key && this.messageKeys.has(key)) {
      antdMessage.destroy(key);
    }
    
    this.messageKeys.add(msgKey);
    
    const hide = antdMessage.loading({
      content,
      duration: duration ?? 0, // 加载消息默认不自动关闭
      key: msgKey,
    });

    return () => {
      hide();
      this.messageKeys.delete(msgKey);
    };
  }

  // 销毁所有消息
  static destroyAll() {
    antdMessage.destroy();
    this.messageKeys.clear();
  }

  // 销毁指定key的消息
  static destroy(key?: string) {
    if (key) {
      antdMessage.destroy(key);
      this.messageKeys.delete(key);
    } else {
      this.destroyAll();
    }
  }
}

// 导出消息工具
export const message = MessageUtil;

// 也导出原始的antd message，以防需要更多自定义配置
export { antdMessage };

// 导出类型
export type { MessageArgsProps };