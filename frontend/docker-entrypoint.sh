#!/bin/sh

# 替换环境变量
if [ -n "$REACT_APP_API_URL" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3001|$REACT_APP_API_URL|g" {} \;
fi

# 启动nginx
exec "$@" 