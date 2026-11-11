#!/bin/bash
# Copyright (C) 2026 Robin Stuart <rstuart114@gmail.com>
# SPDX-License-Identifier: BSD-3-Clause
# vim: set ts=4 sw=4 et :
#
# Compile zint with gcc and "-DZINT_COVERAGE=ON -DZINT_DEBUG=ON -DZINT_TEST=ON"
# Run this script in the build directory (same as ctest but with debug flag set):
#   ../backend/tests/tools/run_coverage.sh
# will produce "html_report/index.html"
#
set -e

backend/tests/test_2of5 -d 1
backend/tests/test_auspost -d 1
backend/tests/test_aztec -d 1
backend/tests/test_bc412 -d 1
backend/tests/test_big5 -d 1
backend/tests/test_bmp -d 1
backend/tests/test_bwipp -d 1
backend/tests/test_channel -d 1
backend/tests/test_codabar -d 1
backend/tests/test_codablock -d 1
backend/tests/test_code -d 1
backend/tests/test_code1 -d 1
backend/tests/test_code11 -d 1
backend/tests/test_code128 -d 1
backend/tests/test_code16k -d 1
backend/tests/test_code49 -d 1
backend/tests/test_common -d 1
backend/tests/test_composite -d 1
backend/tests/test_dmatrix -d 1
backend/tests/test_dotcode -d 1
backend/tests/test_dxfilmedge -d 1
backend/tests/test_eci -d 1
backend/tests/test_emf -d 1
backend/tests/test_filemem -d 1
backend/tests/test_gb18030 -d 1
backend/tests/test_gb2312 -d 1
backend/tests/test_gif -d 1
backend/tests/test_gridmtx -d 1
backend/tests/test_gs1 -d 1
backend/tests/test_gs1se -d 1
backend/tests/test_hanxin -d 1
backend/tests/test_imail -d 1
backend/tests/test_iso3166 -d 1
backend/tests/test_iso4217 -d 1
backend/tests/test_ksx1001 -d 1
backend/tests/test_large -d 1
backend/tests/test_library -d 1
backend/tests/test_mailmark -d 1
backend/tests/test_maxicode -d 1
backend/tests/test_medical -d 1
backend/tests/test_output -d 1
backend/tests/test_pcx -d 1
backend/tests/test_pdf417 -d 1
backend/tests/test_perf -d 1
backend/tests/test_plessey -d 1
backend/tests/test_png -d 1
backend/tests/test_postal -d 1
backend/tests/test_print -d 1
backend/tests/test_ps -d 1
backend/tests/test_qr -d 1
backend/tests/test_random -d 1
backend/tests/test_raster -d 1
backend/tests/test_reedsol -d 1
backend/tests/test_rss -d 1
backend/tests/test_sjis -d 1
backend/tests/test_svg -d 1
backend/tests/test_telepen -d 1
backend/tests/test_tif -d 1
backend/tests/test_ultra -d 1
backend/tests/test_upcean -d 1
backend/tests/test_vector -d 1
frontend/tests/test_args
backend_qt/tests/test_qzint

lcov --capture --directory . --output-file coverage.info --exclude 'build/*' --exclude 'usr/*' --exclude 'tests/*'
genhtml -o html_report coverage.info
