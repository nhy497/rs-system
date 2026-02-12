#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RS-System 文檔智能重命名工具 V3
使用 Git 歷史獲取文件真實創建時間
"""

import os
import re
import subprocess
from datetime import datetime

def get_git_first_commit_time(file_path):
    """從 Git 獲取文件首次提交時間"""
    try:
        # 使用 git log 獲取文件最早提交時間
        cmd = ['git', 'log', '--follow', '--format=%aI', '--diff-filter=A', '--', file_path]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        if result.stdout.strip():
            # 獲取第一行(最早的提交)
            time_str = result.stdout.strip().split('\n')[0]
            # 解析 ISO 8601 格式
            dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
            # 轉換為本地時間
            return dt

        return None
    except:
        return None

def extract_date_from_content(file_path):
    """從文件內容中提取日期"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        patterns = [
            r'\*\*[日期報告]*日期[報告]*\*\*[:\s：]*(\d{4})[-年/](\d{1,2})[-月/](\d{1,2})',
            r'Report Date[:\s：]*(\d{4})-(\d{1,2})-(\d{1,2})',
            r'最近更新[:\s：]*(\d{4})-(\d{1,2})-(\d{1,2})',
            r'最[後后]更新[:\s：]*(\d{4})-(\d{1,2})-(\d{1,2})',
        ]

        for pattern in patterns:
            match = re.search(pattern, content, re.MULTILINE)
            if match:
                year, month, day = match.groups()[:3]
                return datetime(int(year), int(month), int(day), 12, 0)

        return None
    except:
        return None

def main():
    print("🔍 RS-System 文檔智能重命名工具 V3 (Git 版)")
    print("=" * 70)

    # 檢查 Git
    try:
        subprocess.run(['git', '--version'], capture_output=True, check=True)
        print("✅ Git 可用")
    except:
        print("❌ 錯誤: 未找到 Git!")
        print("   請確保 Git 已安裝並在 PATH 中")
        input("按 Enter 鍵退出...")
        return

    if not os.path.exists('docs'):
        print("❌ 錯誤: 找不到 docs 目錄!")
        input("按 Enter 鍵退出...")
        return

    if not os.path.exists('.git'):
        print("❌ 錯誤: 不在 Git 倉庫中!")
        input("按 Enter 鍵退出...")
        return

    print("✅ 在 Git 倉庫中")
    print("\n📋 開始掃描文件...\n")

    # 需要重命名的文件列表
    files_to_rename = [
        ('docs/changelog/CHANGELOG.md', '變更日誌索引'),
        ('docs/changelog/change_template.md', '變更記錄模板'),
        ('docs/changelog/v2.1_features.md', 'V2.1功能清單'),
        ('docs/changelog/v2.1_report.md', 'V2.1完成報告'),
        ('docs/changelog/ROADMAP.md', '開發路線圖'),
        ('docs/changelog/UPGRADE_GUIDE.md', '升級指南'),
        ('docs/changelog/UPGRADE_HISTORY.md', '升級歷史'),

        ('docs/archive/bug-fixes/session_breakage_analysis.md', 'Session中斷分析'),
        ('docs/archive/bug-fixes/ci_cd_fix.md', 'CICD部署修復'),
        ('docs/archive/bug-tracking/bug_tracking_history.md', 'Bug追蹤歷史'),

        ('docs/testing/acceptance_checklist.md', '驗收測試清單'),
        ('docs/testing/testing_guide.md', '測試指南'),
        ('docs/testing/quick_test_guide.md', '快速測試指南'),
        ('docs/testing/test_plan.md', '測試計劃'),
    ]

    renamed = 0
    skipped = 0

    for old_path, desc in files_to_rename:
        if not os.path.exists(old_path):
            print(f"⏭️  跳過: {old_path} (不存在)")
            skipped += 1
            continue

        print(f"\n📄 處理: {os.path.basename(old_path)}")

        # 特殊處理:模板文件
        if 'template' in old_path.lower():
            new_name = f"TEMPLATE_{desc}.md"
            print(f"  ℹ️  模板文件,使用特殊命名")
        else:
            # 優先從內容提取日期
            date = extract_date_from_content(old_path)
            if date:
                print(f"  ✓ 從內容找到日期: {date.strftime('%Y-%m-%d')}")
            else:
                # 從 Git 獲取時間
                date = get_git_first_commit_time(old_path)
                if date:
                    print(f"  ✓ 從 Git 找到時間: {date.strftime('%Y-%m-%d %H:%M')}")
                else:
                    print(f"  ⚠️  無法獲取日期,跳過此文件")
                    skipped += 1
                    continue

            date_str = date.strftime('%Y%m%d_%H%M')
            new_name = f"{date_str}_{desc}.md"

        new_path = os.path.join(os.path.dirname(old_path), new_name)
        print(f"  → 新名稱: {new_name}")

        if old_path != new_path:
            os.rename(old_path, new_path)
            print(f"  ✅ 重命名成功!")
            renamed += 1
        else:
            print(f"  ✅ 已是正確格式")
            skipped += 1

    print("\n" + "=" * 70)
    print(f"📊 完成!")
    print(f"  ✅ 成功重命名: {renamed} 個文件")
    print(f"  ⏭️  跳過: {skipped} 個文件")
    print("=" * 70)

    if renamed > 0:
        print("\n📌 下一步:")
        print("1. 檢查重命名結果")
        print("2. 提交到 Git:")
        print("   git add .")
        print('   git commit -m "📝 使用Git歷史智能重命名文檔"')
        print("   git push origin main")

    input("\n按 Enter 鍵退出...")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ 發生錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        input("按 Enter 鍵退出...")
