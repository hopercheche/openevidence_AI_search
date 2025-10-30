"""
配置文件 - 支持 Baichuan M2 Plus 模型
"""
import os
from datetime import timedelta

class Config:
    """基础配置"""
    
    # Flask 配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # API 配置
    API_VERSION = '2.0.0'
    API_TITLE = 'OpenEvidence Backend API - Baichuan M2 Plus'
    
    # Baichuan M2 Plus 配置
    BAICHUAN_API_KEY = os.environ.get('BAICHUAN_API_KEY')
    BAICHUAN_BASE_URL = os.environ.get('BAICHUAN_BASE_URL', 'https://api.baichuan-ai.com/v1/')
    BAICHUAN_MODEL = 'Baichuan-M2-Plus'
    
    # CORS 配置
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3100',
        'http://127.0.0.1:3100',
        'https://*.skywork.website'
    ]
    
    # 流式响应配置
    STREAMING_WORD_DELAY = float(os.environ.get('STREAMING_WORD_DELAY', 0.05))
    STREAMING_SEGMENT_DELAY = float(os.environ.get('STREAMING_SEGMENT_DELAY', 0.2))
    
    # LLM 配置
    LLM_TEMPERATURE = float(os.environ.get('LLM_TEMPERATURE', 0.1))
    LLM_MAX_TOKENS = int(os.environ.get('LLM_MAX_TOKENS', 2000))
    LLM_TOP_P = float(os.environ.get('LLM_TOP_P', 0.9))
    
    # 数据库配置（可选）
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///openevidence.db'
    
    # 缓存配置（可选）
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # 日志配置
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    
    # 服务器配置
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 8001))
    
    # 引用配置
    MAX_REFERENCES_PER_RESPONSE = int(os.environ.get('MAX_REFERENCES_PER_RESPONSE', 20))
    REFERENCE_CACHE_SIZE = int(os.environ.get('REFERENCE_CACHE_SIZE', 1000))
    
    # 文本处理配置
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10000))
    MAX_QUESTION_LENGTH = int(os.environ.get('MAX_QUESTION_LENGTH', 2500))

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    TESTING = False
    
    # 开发环境特定配置
    STREAMING_WORD_DELAY = 0.03  # 更快的流式响应
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    TESTING = False
    
    # 生产环境安全配置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # 生产环境性能配置
    STREAMING_WORD_DELAY = 0.05
    LOG_LEVEL = 'INFO'

class TestingConfig(Config):
    """测试环境配置"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'
    
    # 测试环境配置
    STREAMING_WORD_DELAY = 0.01  # 快速测试
    LLM_MAX_TOKENS = 100  # 减少测试时间

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """获取当前配置"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])