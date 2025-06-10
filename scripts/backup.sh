#!/bin/sh

# 数据库备份脚本
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

echo "开始备份数据库..."

# 执行备份
PGPASSWORD=$DB_PASSWORD pg_dump -h postgres -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "备份成功: $BACKUP_FILE"
    # 保留最近7天的备份
    find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
else
    echo "备份失败!"
    exit 1
fi 