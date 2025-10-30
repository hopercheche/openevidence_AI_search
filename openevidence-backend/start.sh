#!/bin/bash

# OpenEvidence Backend 启动脚本 - Baichuan M2 Plus

echo "🚀 启动 OpenEvidence Backend API (Baichuan M2 Plus)..."

# 检查 Python 版本
python_version=$(python3 --version 2>&1)
echo "📋 Python 版本: $python_version"

# 检查环境变量
if [ -f ".env" ]; then
    echo "📄 发现 .env 文件，加载环境变量..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  未发现 .env 文件，使用默认配置"
    echo "   建议复制 .env.example 为 .env 并配置 Baichuan API Key"
fi

# 检查 Baichuan API Key
if [ -z "$BAICHUAN_API_KEY" ]; then
    echo "❌ 错误: 未设置 BAICHUAN_API_KEY 环境变量"
    echo "   请在 .env 文件中设置: BAICHUAN_API_KEY=sk-xxx"
    exit 1
else
    echo "✅ Baichuan API Key: ${BAICHUAN_API_KEY:0:10}..."
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 升级 pip
echo "⬆️  升级 pip..."
pip install --upgrade pip

# 安装依赖
echo "📥 安装依赖包..."
pip install -r requirements.txt

# 检查依赖安装
echo "🔍 检查关键依赖..."
python3 -c "import openai; print('✅ OpenAI 客户端已安装')" || {
    echo "❌ OpenAI 客户端安装失败"
    exit 1
}

python3 -c "import flask; print('✅ Flask 已安装')" || {
    echo "❌ Flask 安装失败"
    exit 1
}

# 设置环境变量
export FLASK_APP=app.py
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 获取配置
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-8000}
FLASK_ENV=${FLASK_ENV:-development}

echo ""
echo "🌐 服务配置:"
echo "   地址: http://$HOST:$PORT"
echo "   环境: $FLASK_ENV"
echo "   模型: Baichuan-M2-Plus"
echo "   API: ${BAICHUAN_BASE_URL:-https://api.baichuan-ai.com/v1/}"
echo ""
echo "📍 可用端点:"
echo "   健康检查: http://$HOST:$PORT/health"
echo "   模型状态: http://$HOST:$PORT/api/model/status"
echo "   问答接口: http://$HOST:$PORT/api/ask"
echo ""
echo "🧪 测试命令:"
echo "   python test_baichuan_api.py"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 app.py