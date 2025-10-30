@echo off
REM OpenEvidence Backend 启动脚本 - Baichuan M2 Plus (Windows)

echo 🚀 启动 OpenEvidence Backend API (Baichuan M2 Plus)...

REM 检查 Python 版本
python --version
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查环境变量文件
if exist ".env" (
    echo 📄 发现 .env 文件
) else (
    echo ⚠️  未发现 .env 文件，使用默认配置
    echo    建议复制 .env.example 为 .env 并配置 Baichuan API Key
)

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 📦 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 🔧 激活虚拟环境...
call venv\Scripts\activate.bat

REM 升级 pip
echo ⬆️  升级 pip...
python -m pip install --upgrade pip

REM 安装依赖
echo 📥 安装依赖包...
pip install -r requirements.txt

REM 检查依赖安装
echo 🔍 检查关键依赖...
python -c "import openai; print('✅ OpenAI 客户端已安装')" || (
    echo ❌ OpenAI 客户端安装失败
    pause
    exit /b 1
)

python -c "import flask; print('✅ Flask 已安装')" || (
    echo ❌ Flask 安装失败
    pause
    exit /b 1
)

REM 设置环境变量
set FLASK_APP=app.py
set PYTHONPATH=%PYTHONPATH%;%CD%

REM 获取配置
if not defined HOST set HOST=0.0.0.0
if not defined PORT set PORT=8000
if not defined FLASK_ENV set FLASK_ENV=development

echo.
echo 🌐 服务配置:
echo    地址: http://%HOST%:%PORT%
echo    环境: %FLASK_ENV%
echo    模型: Baichuan-M2-Plus
echo.
echo 📍 可用端点:
echo    健康检查: http://%HOST%:%PORT%/health
echo    模型状态: http://%HOST%:%PORT%/api/model/status
echo    问答接口: http://%HOST%:%PORT%/api/ask
echo.
echo 🧪 测试命令:
echo    python test_baichuan_api.py
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
python app.py

pause