#!/bin/bash

# n8n工作流生成器 - 自动化部署脚本
# 使用方法: ./deploy.sh [环境] [操作]
# 示例: ./deploy.sh production deploy

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认值
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

# 检查必要的工具
check_requirements() {
    print_message "检查系统要求..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装。请先安装Docker。"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose未安装。请先安装Docker Compose。"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        print_error "环境变量文件 .env.${ENVIRONMENT} 不存在。"
        print_message "正在从模板创建..."
        cp env.production.example .env.${ENVIRONMENT}
        print_warning "请编辑 .env.${ENVIRONMENT} 文件并填入实际配置。"
        exit 1
    fi
}

# 构建镜像
build_images() {
    print_message "构建Docker镜像..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml build --no-cache
}

# 启动服务
start_services() {
    print_message "启动服务..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
}

# 停止服务
stop_services() {
    print_message "停止服务..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml down
}

# 重启服务
restart_services() {
    stop_services
    start_services
}

# 查看日志
show_logs() {
    SERVICE=${3:-all}
    if [ "$SERVICE" = "all" ]; then
        docker-compose -f docker-compose.${ENVIRONMENT}.yml logs -f
    else
        docker-compose -f docker-compose.${ENVIRONMENT}.yml logs -f $SERVICE
    fi
}

# 执行数据库迁移
run_migrations() {
    print_message "执行数据库迁移..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml exec backend npm run migrate
}

# 备份数据库
backup_database() {
    print_message "备份数据库..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker-compose -f docker-compose.${ENVIRONMENT}.yml exec postgres pg_dump -U $DB_USER $DB_NAME > backups/backup_${TIMESTAMP}.sql
    print_message "备份完成: backups/backup_${TIMESTAMP}.sql"
}

# 健康检查
health_check() {
    print_message "执行健康检查..."
    
    # 检查前端
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_message "前端服务: 正常 ✓"
    else
        print_error "前端服务: 异常 ✗"
    fi
    
    # 检查后端
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_message "后端服务: 正常 ✓"
    else
        print_error "后端服务: 异常 ✗"
    fi
    
    # 检查数据库
    if docker-compose -f docker-compose.${ENVIRONMENT}.yml exec postgres pg_isready > /dev/null 2>&1; then
        print_message "数据库服务: 正常 ✓"
    else
        print_error "数据库服务: 异常 ✗"
    fi
}

# SSL证书设置
setup_ssl() {
    print_message "设置SSL证书..."
    
    if [ ! -d "nginx/ssl" ]; then
        mkdir -p nginx/ssl
    fi
    
    # 使用Let's Encrypt
    if command -v certbot &> /dev/null; then
        DOMAIN=${3:-yourdomain.com}
        certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
        print_message "SSL证书设置完成"
    else
        print_warning "Certbot未安装。请手动配置SSL证书。"
    fi
}

# 主部署流程
deploy() {
    print_message "开始部署 n8n 工作流生成器 (${ENVIRONMENT}环境)..."
    
    check_requirements
    build_images
    stop_services
    start_services
    
    # 等待服务启动
    print_message "等待服务启动..."
    sleep 10
    
    run_migrations
    health_check
    
    print_message "部署完成！"
    print_message "前端地址: https://yourdomain.com"
    print_message "API地址: https://api.yourdomain.com"
}

# 显示帮助信息
show_help() {
    echo "n8n工作流生成器 - 部署脚本"
    echo ""
    echo "使用方法: ./deploy.sh [环境] [操作] [参数]"
    echo ""
    echo "环境:"
    echo "  production    生产环境（默认）"
    echo "  staging       预发布环境"
    echo "  development   开发环境"
    echo ""
    echo "操作:"
    echo "  deploy        完整部署流程（默认）"
    echo "  build         仅构建镜像"
    echo "  start         启动服务"
    echo "  stop          停止服务"
    echo "  restart       重启服务"
    echo "  logs          查看日志"
    echo "  migrate       执行数据库迁移"
    echo "  backup        备份数据库"
    echo "  health        健康检查"
    echo "  ssl           设置SSL证书"
    echo "  help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh production deploy"
    echo "  ./deploy.sh production logs backend"
    echo "  ./deploy.sh production ssl yourdomain.com"
}

# 主逻辑
case $ACTION in
    deploy)
        deploy
        ;;
    build)
        build_images
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    migrate)
        run_migrations
        ;;
    backup)
        backup_database
        ;;
    health)
        health_check
        ;;
    ssl)
        setup_ssl
        ;;
    help)
        show_help
        ;;
    *)
        print_error "未知操作: $ACTION"
        show_help
        exit 1
        ;;
esac 