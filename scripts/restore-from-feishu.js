const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const FEISHU_APP_ID = "cli_a97c4a4129781bdf";
const FEISHU_APP_SECRET = "NERYqZERdjLmn3QuCpaaqgVf6eza8nUG";
const BASE_URL = "https://open.feishu.cn/open-apis";

const TABLES = {
  users: { appToken: "HgJzwQMPkiNBiMkmEXMcmLF3nEc", tableId: "tbl1U4Mosd7dzvHD" },
  form1: { appToken: "HgJzwQMPkiNBiMkmEXMcmLF3nEc", tableId: "tbl1g5VYg6nJKUAj" },
  form2: { appToken: "HgJzwQMPkiNBiMkmEXMcmLF3nEc", tableId: "tbl5sonmjYfbEibo" },
  sleep: { appToken: "HgJzwQMPkiNBiMkmEXMcmLF3nEc", tableId: "tbl54plrv4NXtCRS" },
  nutrition: { appToken: "HgJzwQMPkiNBiMkmEXMcmLF3nEc", tableId: "tbl1GMdpnljuWQcI" },
};

let accessToken = null;
const DEFAULT_PASSWORD = "Aa123456"; // 恢复的用户的默认密码

async function getAccessToken() {
  if (accessToken) return accessToken;
  const res = await axios.post(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
    app_id: FEISHU_APP_ID,
    app_secret: FEISHU_APP_SECRET,
  });
  accessToken = res.data.tenant_access_token;
  console.log("✓ 获取 access_token 成功");
  return accessToken;
}

async function fetchAllRecords(tableKey) {
  const token = await getAccessToken();
  const { appToken, tableId } = TABLES[tableKey];
  const records = [];
  let pageToken = "";
  
  do {
    const url = `${BASE_URL}/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=500${pageToken ? "&page_token=" + pageToken : ""}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.data.code !== 0) {
      console.error(`读取 ${tableKey} 失败:`, JSON.stringify(res.data));
      break;
    }
    
    records.push(...(res.data.data.items || []));
    pageToken = res.data.data.page_token;
  } while (pageToken);
  
  console.log(`✓ ${tableKey} 共 ${records.length} 条记录`);
  return records;
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  // 尝试解析 "2026-04-02 19:48:46" 或 "2026/04/01 19:01" 格式
  const cleaned = dateStr.replace(/\//g, "-").replace(" ", "T");
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function restoreUsers(records) {
  console.log("\n=== 恢复用户数据 ===");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  let success = 0, failed = 0, skipped = 0;
  
  for (const record of records) {
    const f = record.fields;
    try {
      const userData = {
        id: f["用户ID"] || `RESTORED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: f["用户名"] || "未知用户",
        phone: f["手机号"] || "",
        password_hash: passwordHash,
        role: f["角色"] === "管理员" ? "admin" : "user",
        created_at: parseDate(f["注册时间"]),
        updated_at: new Date(),
        feishu_record_id: record.record_id,
        feishu_sync_status: "success",
      };
      
      // 检查是否已存在
      const existing = await prisma.users.findUnique({ where: { phone: userData.phone } });
      if (existing) {
        console.log(`  跳过已存在用户: ${userData.phone}`);
        skipped++;
        continue;
      }
      
      await prisma.users.create({ data: userData });
      console.log(`  ✓ 恢复用户: ${userData.username} (${userData.phone})`);
      success++;
    } catch (e) {
      console.error(`  ✗ 失败: ${f["手机号"]} - ${e.message}`);
      failed++;
    }
  }
  
  console.log(`✓ 用户恢复完成: 成功 ${success}, 跳过 ${skipped}, 失败 ${failed}`);
  return { success, failed };
}

async function restoreForm1(records) {
  console.log("\n=== 恢复预约表单(form1)数据 ===");
  let success = 0, failed = 0, skipped = 0;
  
  for (const record of records) {
    const f = record.fields;
    try {
      // 根据"用户ID"查找数据库中的用户
      const feishuUserId = f["用户ID"];
      let userId = null;
      
      // 如果用户ID是 CF 开头的，通过数据库查找
      if (feishuUserId && feishuUserId.startsWith("CF")) {
        const user = await prisma.users.findUnique({ where: { id: feishuUserId } });
        if (user) userId = user.id;
      }
      
      // 如果找不到用户，尝试通过手机号查找
      if (!userId) {
        const phone = f["联系电话"];
        const user = await prisma.users.findUnique({ where: { phone } });
        if (user) userId = user.id;
      }
      
      if (!userId) {
        console.log(`  ✗ 跳过: 找不到用户 ${feishuUserId || f["联系电话"]}`);
        skipped++;
        continue;
      }
      
      const formData = {
        user_id: userId,
        order_no: f["订单编号"] || `RESTORED_F1_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: f["姓名"] || "",
        phone: f["联系电话"] || "",
        consultation_type: f["咨询类型"] || "",
        preferred_date: f["预约日期"] || "",
        preferred_time: f["预约时间"] || "",
        brief: f["简要说明"] || "",
        submitted_by: f["姓名"] || "",
        status: "active",
        submitted_at: parseDate(f["提交时间"]),
        updated_at: new Date(),
        version_number: parseInt(f["版本号"]) || 1,
        feishu_record_id: record.record_id,
        feishu_sync_status: "success",
      };
      
      // 检查是否已存在
      const existing = await prisma.form1_submissions.findUnique({ where: { order_no: formData.order_no } });
      if (existing) {
        console.log(`  跳过已存在: ${formData.order_no}`);
        skipped++;
        continue;
      }
      
      await prisma.form1_submissions.create({ data: formData });
      console.log(`  ✓ 恢复预约: ${formData.order_no} - ${formData.name}`);
      success++;
    } catch (e) {
      console.error(`  ✗ 失败: ${f["订单编号"]} - ${e.message}`);
      failed++;
    }
  }
  
  console.log(`✓ form1恢复完成: 成功 ${success}, 跳过 ${skipped}, 失败 ${failed}`);
  return { success, failed };
}

async function restoreForm2(records) {
  console.log("\n=== 恢复健康档案(form2)数据 ===");
  let success = 0, failed = 0, skipped = 0;
  
  for (const record of records) {
    const f = record.fields;
    try {
      // 通过用户ID或手机号查找用户
      const feishuUserId = f["用户ID"];
      let userId = null;
      
      if (feishuUserId && feishuUserId.startsWith("CF")) {
        const user = await prisma.users.findUnique({ where: { id: feishuUserId } });
        if (user) userId = user.id;
      }
      
      if (!userId) {
        const phone = f["联系电话"];
        const user = await prisma.users.findUnique({ where: { phone } });
        if (user) userId = user.id;
      }
      
      if (!userId) {
        console.log(`  ✗ 跳过: 找不到用户 ${feishuUserId || f["联系电话"]}`);
        skipped++;
        continue;
      }
      
      // 构建form_data JSON
      const formDataObj = {
        name: f["姓名"],
        phone: f["联系电话"],
        emergencyContact: f["紧急联系人"],
        emergencyPhone: f["紧急联系人电话"],
        sleepDuration: f["睡眠时长"],
        sleepQuality: f["睡眠质量"],
        stressLevel: f["压力自评"],
        brainFog: f["脑雾症状"] ? f["脑雾症状"].split("，") : [],
        currentDiseases: f["当前疾病"],
        medication: f["目前用药"],
        surgeryHistory: f["手术史"],
        allergyHistory: f["过敏史"],
        exerciseType: f["运动类型"],
        dietaryPreference: f["饮食偏好"],
      };
      
      // 处理附件
      const uploadedFiles = [];
      for (let i = 1; i <= 5; i++) {
        const attachment = f[`附件${i}`];
        if (attachment && attachment.link) {
          uploadedFiles.push({ name: attachment.text, url: attachment.link });
        }
      }
      if (uploadedFiles.length > 0) {
        formDataObj.uploadedFiles = uploadedFiles;
      }
      
      const formData = {
        user_id: userId,
        order_no: `RESTORED_F2_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: f["姓名"] || "",
        phone: f["联系电话"] || "",
        submitted_by: f["姓名"] || "",
        form_data: JSON.stringify(formDataObj),
        submitted_at: parseDate(f["提交时间"]),
        updated_at: new Date(),
        version_number: 1,
        feishu_record_id: record.record_id,
        feishu_sync_status: "success",
      };
      
      // 检查是否已存在相同的记录（通过用户ID和姓名）
      const existing = await prisma.form2_submissions.findFirst({
        where: { user_id: userId, name: formData.name }
      });
      if (existing) {
        console.log(`  跳过已存在: 用户 ${userId} 的健康档案`);
        skipped++;
        continue;
      }
      
      await prisma.form2_submissions.create({ data: formData });
      console.log(`  ✓ 恢复健康档案: ${formData.name}`);
      success++;
    } catch (e) {
      console.error(`  ✗ 失败: ${f["姓名"]} - ${e.message}`);
      failed++;
    }
  }
  
  console.log(`✓ form2恢复完成: 成功 ${success}, 跳过 ${skipped}, 失败 ${failed}`);
  return { success, failed };
}

async function main() {
  console.log("========================================");
  console.log("   从飞书恢复数据到数据库");
  console.log("========================================\n");
  
  // 备份当前数据库
  console.log("备份当前数据库...");
  const fs = require("fs");
  const backupPath = `prisma/prod.db.before-restore-${Date.now()}`;
  fs.copyFileSync("prisma/prod.db", backupPath);
  console.log(`✓ 已备份到: ${backupPath}\n`);
  
  // 读取飞书数据
  console.log("=== 从飞书读取数据 ===");
  const users = await fetchAllRecords("users");
  const form1 = await fetchAllRecords("form1");
  const form2 = await fetchAllRecords("form2");
  
  console.log("\n飞书数据汇总:");
  console.log(`  用户: ${users.length}`);
  console.log(`  预约表单: ${form1.length}`);
  console.log(`  健康档案: ${form2.length}`);
  
  // 恢复数据
  const userResult = await restoreUsers(users);
  const form1Result = await restoreForm1(form1);
  const form2Result = await restoreForm2(form2);
  
  // 统计
  console.log("\n========================================");
  console.log("   恢复完成统计");
  console.log("========================================");
  console.log(`用户: 成功 ${userResult.success}, 失败 ${userResult.failed}`);
  console.log(`预约表单: 成功 ${form1Result.success}, 失败 ${form1Result.failed}`);
  console.log(`健康档案: 成功 ${form2Result.success}, 失败 ${form2Result.failed}`);
  console.log(`\n注意: 恢复的用户默认密码为 "${DEFAULT_PASSWORD}"`);
  
  // 验证数据库
  console.log("\n=== 验证数据库 ===");
  const dbUsers = await prisma.users.count();
  const dbForm1 = await prisma.form1_submissions.count();
  const dbForm2 = await prisma.form2_submissions.count();
  console.log(`数据库当前: users=${dbUsers}, form1=${dbForm1}, form2=${dbForm2}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
