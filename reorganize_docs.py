#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RS-System 文檔重組腳本
自動將根目錄的文檔移動到 docs/ 子目錄

使用方法:
1. 確保你已經 clone 了 rs-system 倉庫
2. 將此腳本放在 rs-system 根目錄
3. 雙擊運行或在終端執行: python reorganize_docs.py
"""

import os
import shutil
from pathlib import Path

def main():
    print("🚀 RS-System 文檔重組工具")
    print("=" * 60)
    
    # 檢查是否在正確的目錄
    if not os.path.exists('.git'):
        print("❌ 錯誤:請在 rs-system 根目錄執行此腳本!")
        input("按 Enter 鍵退出...")
        return
    
    print("✅ 檢測到 Git 倉庫")
    
    # 定義文件映射:原文件名 -> 新路徑
    file_mapping = {
        # Bug 修復文檔
        'BUG_FIX_REPORT_LOGIN_20250121.md': 'docs/archive/bug-fixes/20250121_0240_登入系統修復.md',
        'BUG_TRACKING.md': 'docs/archive/bug-tracking/bug_tracking_history.md',
        'LOGIN_REDIRECT_FIX_REPORT_20260125.md': 'docs/archive/bug-fixes/20260125_登入重定向修復報告.md',
        'SESSION_BREAKAGE_ROOT_CAUSE_ANALYSIS.md': 'docs/archive/bug-fixes/session_breakage_analysis.md',
        'CI_CD_FIX.md': 'docs/archive/bug-fixes/ci_cd_fix.md',
        
        # 測試文檔
        'ACCEPTANCE_CHECKLIST.md': 'docs/testing/acceptance_checklist.md',
        'TESTING_GUIDE.md': 'docs/testing/testing_guide.md',
        'QUICK_TEST_GUIDE.md': 'docs/testing/quick_test_guide.md',
        'TEST_PLAN.md': 'docs/testing/test_plan.md',
        'SIGNUP_TESTING_GUIDE.md': 'docs/testing/signup_testing_guide.md',
        'TEST_IMPROVEMENT_REPORT.md': 'docs/archive/reports/test_improvement_report.md',
        'TEST_FILES_ORGANIZATION_REPORT.md': 'docs/archive/reports/test_files_organization.md',
        'PHASE3_TEST_EXECUTION.md': 'docs/archive/reports/phase3_test_execution.md',
        
        # QA 文檔
        'QA_REPORT.md': 'docs/quality-assurance/qa_report.md',
        'QA_SUMMARY.md': 'docs/quality-assurance/qa_summary.md',
        'QA_VERIFICATION_COMPLETE.md': 'docs/quality-assurance/qa_verification_complete.md',
        'QA_DOCUMENTATION_INDEX.md': 'docs/quality-assurance/documentation_index.md',
        
        # 實現摘要
        'IMPLEMENTATION_SUMMARY.md': 'docs/archive/implementation/implementation_summary_v1.md',
        'IMPLEMENTATION_SUMMARY_v2.1.md': 'docs/archive/implementation/implementation_summary_v2.1.md',
        'CODE_CHANGES_DETAIL.md': 'docs/archive/implementation/code_changes_detail.md',
        
        # PouchDB 文檔
        'POUCHDB_README.md': 'docs/features/pouchdb/README.md',
        'POUCHDB_QUICK_START.md': 'docs/features/pouchdb/quick_start.md',
        'POUCHDB_SYSTEM_GUIDE.md': 'docs/features/pouchdb/system_guide.md',
        'POUCHDB_IMPLEMENTATION_REPORT.md': 'docs/archive/reports/pouchdb_implementation.md',
        'POUCHDB_COMPLETION_SUMMARY.md': 'docs/archive/reports/pouchdb_completion.md',
        'POUCHDB_DOCUMENTATION_INDEX.md': 'docs/features/pouchdb/documentation_index.md',
        
        # 開發指南
        'DEVELOPER_GUIDE.md': 'docs/guides/developer_guide.md',
        'CREATOR_GUIDE.md': 'docs/guides/creator_guide.md',
        'INTEGRATION_GUIDE.md': 'docs/guides/integration_guide.md',
        'UPGRADE_GUIDE.md': 'docs/guides/upgrade_guide.md',
        'SYNC_SETUP_GUIDE.md': 'docs/guides/sync_setup.md',
        
        # 快速參考
        'QUICK_REFERENCE.md': 'docs/quick-reference/system_overview.md',
        'LOGIN_QUICK_REFERENCE.md': 'docs/quick-reference/login_system.md',
        'FIXES_QUICK_START.md': 'docs/quick-reference/fixes_quick_start.md',
        'INTEGRATION_QUICK_COMMANDS.md': 'docs/quick-reference/integration_commands.md',
        'QUICK_INTEGRATION_CHECKLIST.md': 'docs/quick-reference/integration_checklist.md',
        
        # 驗證報告
        'VERIFICATION_REPORT.md': 'docs/archive/verification/verification_report.md',
        'VERIFICATION_LOG_20250121.md': 'docs/archive/verification/20250121_log.md',
        'VERIFICATION_REPORT_20250121.md': 'docs/archive/verification/20250121_report.md',
        'VERIFICATION_SUMMARY_TC.md': 'docs/archive/verification/summary_tc.md',
        'FINAL_VERIFICATION_CHECKLIST.md': 'docs/archive/verification/final_checklist.md',
        'LOGIN_SYSTEM_VERIFICATION.md': 'docs/archive/verification/login_system.md',
        
        # 完成報告
        'FINAL_COMPLETION_SUMMARY.md': 'docs/archive/reports/final_completion_summary.md',
        'FINAL_DELIVERY_REPORT.md': 'docs/archive/reports/final_delivery_report.md',
        'PROJECT_COMPLETION_REPORT.md': 'docs/archive/reports/project_completion.md',
        
        # 改進文檔
        'IMPROVEMENTS_COMPLETED.md': 'docs/archive/improvements/completed.md',
        'IMPROVEMENTS_READY.md': 'docs/archive/improvements/ready.md',
        'IMPROVEMENTS_SUMMARY.md': 'docs/archive/improvements/summary.md',
        'UPGRADE_EXECUTION_COMPLETE.md': 'docs/archive/improvements/upgrade_execution.md',
        
        # 更新日誌
        'CHANGE_LOG.md': 'docs/changelog/CHANGELOG.md',
        'CHANGE_TEMPLATE.md': 'docs/changelog/change_template.md',
        'UPDATE_20250121_FEATURES_1-4_FIREBASE.md': 'docs/changelog/20250121_features_1-4_firebase.md',
        'v2.1_FEATURES.md': 'docs/changelog/v2.1_features.md',
        'v2.1_REPORT.md': 'docs/changelog/v2.1_report.md',
        
        # 其他文檔
        'START_HERE.md': 'docs/START_HERE.md',
        'ROADMAP.md': 'docs/planning/ROADMAP.md',
        'SIDEBAR_COLLAPSE_GITHUB_GUIDE.md': 'docs/guides/sidebar_collapse_github.md',
        'APP_JS_PATCH_SIDEBAR.txt': 'docs/archive/patches/app_js_patch_sidebar.txt',
    }
    
    print(f"\n📋 準備移動 {len(file_mapping)} 個文件...")
    
    moved_count = 0
    skipped_count = 0
    error_count = 0
    
    for old_path, new_path in file_mapping.items():
        # 檢查源文件是否存在
        if not os.path.exists(old_path):
            print(f"⏭️  跳過 {old_path} (不存在)")
            skipped_count += 1
            continue
        
        try:
            # 創建目標目錄
            new_dir = os.path.dirname(new_path)
            os.makedirs(new_dir, exist_ok=True)
            
            # 移動文件
            shutil.move(old_path, new_path)
            print(f"✅ 移動: {old_path} -> {new_path}")
            moved_count += 1
            
        except Exception as e:
            print(f"❌ 錯誤: {old_path} - {str(e)}")
            error_count += 1
    
    # 顯示摘要
    print("\n" + "=" * 60)
    print("📊 重組完成摘要:")
    print(f"  ✅ 成功移動: {moved_count} 個文件")
    print(f"  ⏭️  跳過: {skipped_count} 個文件")
    print(f"  ❌ 錯誤: {error_count} 個文件")
    print("=" * 60)
    
    if moved_count > 0:
        print("\n🎉 文件重組完成!")
        print("\n📌 下一步:")
        print("1. 檢查文件是否正確移動")
        print("2. 提交更改到 Git:")
        print("   git add .")
        print('   git commit -m "📁 重組文檔結構"')
        print("   git push origin main")
    else:
        print("\n⚠️  沒有文件被移動,請檢查是否已經重組過")
    
    input("\n按 Enter 鍵退出...")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ 發生錯誤: {str(e)}")
        input("按 Enter 鍵退出...")
