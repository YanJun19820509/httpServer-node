# httpServer-node
node http 服务器框架


开启服务：npm run start
开启服务并实时更新重启（开发用）：npm run watch

excel 导出 json
excel导出json需要满足一些格式要求
1.excel文件名是由字母组成
2.excel表名由字母组成，如果需要中文注释，用!分隔，如 test!测试
3.表内第一行为注释行，不可为空
4.表内第二行为字段名称，由字母组成
5.表内第三行为字段数据类型，支持3种：num--数字，str--字符串，arr--数组
6.表内从第四行开始为数据
7.如果需要在表内添加说明内容，需要空出一列，与正式数据分离