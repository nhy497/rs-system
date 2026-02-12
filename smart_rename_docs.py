#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RS-System 文檔智能重命名工具
根據文件內容中的日期,按照 YYYYMMDD_HHMM_描述.md 格式重命名

使用方法:
1. 確保在 rs-system 倉庫目錄執行
2. 執行: python smart_rename_docs.py
"""

import os
import re
from datetime import datetime

def extract_date_from_content(file_path):
    """從文件內容中提取日期"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 嘗試多種日期格式
        patterns = [
            # 格式: **日期**: 2026年1月21日 或 2026-01-21 或 2025-01-20
            r'\*\*[日期報告]*日期[報告]*\*\*[:\s：]*([\d]{4})[-年/]([\d]{1,2})[-月/]([\d]{1,2})',
            # 格式: Report Date: 2025-01-21
            r'Report Date[:\s：]*([\d]{4})-([\d]{1,2})-([\d]{1,2})',
            # 格式: 最近更新：2025-01-20
            r'最近更新[:\s：]*([\d]{4})-([\d]{1,2})-([\d]{1,2})',
            # 格式: 最後更新：2025-01-20
            r'最[後后]更新[:\s：]*([\d]{4})-([\d]{1,2})-([\d]{1,2})',
            # 格式: 2025-01-20 (在前100行)
            r'^([\d]{4})-([\d]{1,2})-([\d]{1,2})',
        ]

        for pattern in patterns:
            match = re.search(pattern, content, re.MULTILINE)
            if match:
                year, month, day = match.groups()[:3]
                # 假設時間為中午12:00
                return datetime(int(year), int(month), int(day), 12, 0)

        return None
    except Exception as e:
        print(f"  警告: 無法讀取文件 {file_path}: {e}")
        return None

def main():
    print("🔍 RS-System 文檔智能重命名工具")
    print("=" * 70)

    # 檢查目錄
    if not os.path.exists('docs'):
        print("❌ 錯誤: 找不到 docs 目錄!")
        print("   請在 rs-system 根目錄執行此腳本")
        input("按 Enter 鍵退出...")
        return

    print("✅ 找到 docs 目錄")
    print("\n📋 開始掃描和重命名文件...\n")

    # 定義要重命名的文件及其描述
    rename_map = {
        # Bug 修復文檔
        'docs/archive/bug-fixes/20250121_0240_登入系統修復.md': '登入系統修復',
        'docs/archive/bug-fixes/20260125_登入重定向修復報告.md': '登入重定向修復',
        'docs/archive/bug-fixes/session_breakage_analysis.md': 'Session中斷根因分析',
        'docs/archive/bug-fixes/ci_cd_fix.md': 'CICD部署修復',

        # Bug 追蹤
        'docs/archive/bug-tracking/bug_tracking_history.md': 'Bug追蹤歷史',

        # 測試文檔
        'docs/testing/acceptance_checklist.md': '驗收測試清單',
        'docs/testing/testing_guide.md': '測試指南',
        'docs/testing/quick_test_guide.md': '快速測試指南',
        'docs/testing/test_plan.md': '測試計劃',

        # 報告
        'docs/archive/reports/test_improvement_report.md': '測試改進報告',
        'docs/archive/reports/pouchdb_implementation.md': 'PouchDB實現報告',
        'docs/archive/reports/pouchdb_completion.md': 'PouchDB完成總結',
        'docs/archive/reports/final_completion_summary.md': '最終完成總結',

        # QA 文檔  
        'docs/quality-assurance/qa_report.md': 'QA報告',
        'docs/quality-assurance/qa_summary.md': 'QA總結',

        # 變更日誌
        'docs/changelog/CHANGELOG.md': '變更日誌索引',
        'docs/changelog/change_template.md': '變更記錄模板',
    }

    renamed_count = 0
    skipped_count = 0
    error_count = 0

    for old_path, description in rename_map.items():
        # 檢查文件是否存在
        if not os.path.exists(old_path):
            print(f"⏭️  跳過: {old_path} (檔案不存在)")
            skipped_count += 1
            continue

        try:
            # 從文件內容提取日期
            print(f"\n📄 處理: {os.path.basename(old_path)}")
            extracted_date = extract_date_from_content(old_path)

            if extracted_date:
                # 生成新文件名
                date_str = extracted_date.strftime("%Y%m%d_%H%M")
                new_filename = f"{date_str}_{description}.md"
                new_path = os.path.join(os.path.dirname(old_path), new_filename)

                print(f"  ✓ 找到日期: {extracted_date.strftime('%Y-%m-%d')}")
                print(f"  → 新名稱: {new_filename}")

                # 檢查是否已經是正確名稱
                if old_path == new_path:
                    print(f"  ✅ 已經是正確格式,跳過")
                    skipped_count += 1
                    continue

                # 重命名
                os.rename(old_path, new_path)
                print(f"  ✅ 重命名成功!")
                renamed_count += 1
            else:
                print(f"  ⚠️  無法從內容提取日期")
                print(f"  ℹ️  保持原文件名不變")
                skipped_count += 1

        except Exception as e:
            print(f"  ❌ 錯誤: {str(e)}")
            error_count += 1

    # 顯示摘要
    print("\n" + "=" * 70)
    print("📊 重命名完成摘要:")
    print(f"  ✅ 成功重命名: {renamed_count} 個文件")
    print(f"  ⏭️  跳過: {skipped_count} 個文件")
    print(f"  ❌ 錯誤: {error_count} 個文件")
    print("=" * 70)

    if renamed_count > 0:
        print("\n🎉 文件重命名完成!")
        print("\n📌 下一步:")
        print("1. 檢查重命名結果")
        print("2. 提交到 Git:")
        print("   git add .")
        print('   git commit -m "📝 根據文件內容智能重命名文檔"')
        print("   git push origin main")
    else:
        print("\n⚠️  沒有文件被重命名")
        print("   可能的原因:")
        print("   - 文件已經符合命名規則")
        print("   - 文件不存在")
        print("   - 無法從內容中提取日期")

    input("\n按 Enter 鍵退出...")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ 發生錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        input("按 Enter 鍵退出...")
