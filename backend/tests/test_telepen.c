/*
    libzint - the open source barcode library
    Copyright (C) 2020-2026 Robin Stuart <rstuart114@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

    1. Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in the
       documentation and/or other materials provided with the distribution.
    3. Neither the name of the project nor the names of its contributors
       may be used to endorse or promote products derived from this software
       without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
    OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
    OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.
 */
/* SPDX-License-Identifier: BSD-3-Clause */

#include "testcommon.h"

static void test_large(const testCtx *const p_ctx) {
    int debug = p_ctx->debug;

    struct item {
        int symbology;
        int option_2;
        const char *pattern;
        int length;
        int ret;
        int expected_rows;
        int expected_width;
        const char *expected_errtxt;
    };
    /* s/\/\*[ 0-9]*\*\//\=printf("\/\*%3d*\/", line(".") - line("'<")): */
    static const struct item data[] = {
        /*  0*/ { BARCODE_TELEPEN, -1, "\177", 69, 0, 1, 1152, "" },
        /*  1*/ { BARCODE_TELEPEN, -1, "\177", 70, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 70 too long, requires 70 symbol characters (maximum 69)" },
        /*  2*/ { BARCODE_TELEPEN, 1, "\177", 69, 0, 1, 1152, "" },
        /*  3*/ { BARCODE_TELEPEN, 1, "\177", 70, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 70 too long, requires 70 symbol characters (maximum 69)" },
        /*  4*/ { BARCODE_TELEPEN, 1, "\177", 136, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 136 too long, requires 136 symbol characters (maximum 69)" },
        /*  5*/ { BARCODE_TELEPEN, 1, "\177", 137, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 137 too long, requires 137 symbol characters (maximum 69)" },
        /*  6*/ { BARCODE_TELEPEN, 1, "\177", 200, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 200 too long, requires 200 symbol characters (maximum 69)" },
        /*  7*/ { BARCODE_TELEPEN, 1, "\177", 201, ZINT_ERROR_TOO_LONG, -1, -1, "Error 399: Input length 201 too long, requires too many symbol characters (maximum 69)" },
        /*  8*/ { BARCODE_TELEPEN, -1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\020", 69, 0, 1, 1152, "" },
        /*  9*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\020", 69, 0, 1, 1152, "" },
        /* 10*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\0201", 69, 0, 1, 1152, "" },
        /* 11*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\02012", 70, 0, 1, 1152, "" },
        /* 12*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\020123", 71, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 71 too long, requires 70 symbol characters (maximum 69)" },
        /* 13*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\0201234", 72, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 72 too long, requires 70 symbol characters (maximum 69)" },
        /* 14*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\0201234", 71, 0, 1, 1152, "" },
        /* 15*/ { BARCODE_TELEPEN, 1, "\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\177\02012345", 72, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 72 too long, requires 70 symbol characters (maximum 69)" },
        /* 16*/ { BARCODE_TELEPEN, 1, "\177\02012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234", 136, 0, 1, 1152, "" },
        /* 17*/ { BARCODE_TELEPEN, 1, "\177\020123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345", 137, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 137 too long, requires 70 symbol characters (maximum 69)" },
        /* 18*/ { BARCODE_TELEPEN, 1, "\177\177\020123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012", 135, 0, 1, 1152, "" },
        /* 19*/ { BARCODE_TELEPEN, 1, "\177\177\0201234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123", 136, ZINT_ERROR_TOO_LONG, -1, -1, "Error 390: Input length 136 too long, requires 70 symbol characters (maximum 69)" },
        /* 20*/ { BARCODE_TELEPEN_NUM, -1, "1", 138, 0, 1, 1152, "" },
        /* 21*/ { BARCODE_TELEPEN_NUM, -1, "1", 139, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 139 too long, requires 70 symbol characters (maximum 69)" },
        /* 22*/ { BARCODE_TELEPEN_NUM, 1, "1", 138, 0, 1, 1152, "" },
        /* 23*/ { BARCODE_TELEPEN_NUM, 1, "1", 139, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 139 too long, requires 70 symbol characters (maximum 69)" },
        /* 24*/ { BARCODE_TELEPEN_NUM, 1, "1", 200, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 200 too long, requires 100 symbol characters (maximum 69)" },
        /* 25*/ { BARCODE_TELEPEN_NUM, 1, "1", 201, ZINT_ERROR_TOO_LONG, -1, -1, "Error 400: Input length 201 too long, requires too many symbol characters (maximum 69)" },
        /* 26*/ { BARCODE_TELEPEN_NUM, -1, "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456\020", 137, 0, 1, 1152, "" },
        /* 27*/ { BARCODE_TELEPEN_NUM, -1, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567\020", 138, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 138 too long, requires 70 symbol characters (maximum 69)" },
        /* 28*/ { BARCODE_TELEPEN_NUM, -1, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234\020\177", 136, 0, 1, 1152, "" },
        /* 29*/ { BARCODE_TELEPEN_NUM, -1, "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345\020\177", 137, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 137 too long, requires 70 symbol characters (maximum 69)" },
        /* 30*/ { BARCODE_TELEPEN_NUM, -1, "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012\020\177\177", 135, 0, 1, 1152, "" },
        /* 31*/ { BARCODE_TELEPEN_NUM, -1, "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123\020\177\177", 136, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 136 too long, requires 70 symbol characters (maximum 69)" },
        /* 32*/ { BARCODE_TELEPEN_NUM, -1, "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890\020\177\177\177", 134, 0, 1, 1152, "" },
        /* 33*/ { BARCODE_TELEPEN_NUM, -1, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901\020\177\177\177", 135, ZINT_ERROR_TOO_LONG, -1, -1, "Error 392: Input length 135 too long, requires 70 symbol characters (maximum 69)" },
    };
    const int data_size = ARRAY_SIZE(data);
    int i, length, ret;
    struct zint_symbol *symbol = NULL;

    char data_buf[256];

    char escaped[8192];
    char escaped2[8192];
    char cmp_buf[8192];
    char cmp_msg[1024];
    char ret_buf[8192];

    /* Only do zxing-cpp tests if asked, too slow otherwise */
    int do_zxingcpp = (debug & ZINT_DEBUG_TEST_ZXINGCPP) && testUtilHaveZXingCPPDecoder();

    testStartSymbol(p_ctx->func_name, &symbol);

    for (i = 0; i < data_size; i++) {

        if (testContinue(p_ctx, i)) continue;

        symbol = ZBarcode_Create();
        assert_nonnull(symbol, "Symbol not created\n");

        testUtilStrCpyRepeat(data_buf, data[i].pattern, data[i].length);
        assert_equal(data[i].length, (int) strlen(data_buf), "i:%d length %d != strlen(data_buf) %d\n",
                    i, data[i].length, (int) strlen(data_buf));

        length = testUtilSetSymbol(symbol, data[i].symbology, -1 /*input_mode*/, -1 /*eci*/,
                                    -1 /*option_1*/, data[i].option_2, -1, -1 /*output_options*/,
                                    data_buf, data[i].length, debug);

        ret = ZBarcode_Encode(symbol, ZCUCP(data_buf), length);
        assert_equal(ret, data[i].ret, "i:%d ZBarcode_Encode ret %d != %d (%s)\n",
                    i, ret, data[i].ret, symbol->errtxt);
        assert_equal(symbol->errtxt[0] == '\0', ret == 0, "i:%d symbol->errtxt not %s (%s)\n",
                    i, ret ? "set" : "empty", symbol->errtxt);
        assert_zero(strcmp(symbol->errtxt, data[i].expected_errtxt), "i:%d strcmp(%s, %s) != 0\n",
                    i, symbol->errtxt, data[i].expected_errtxt);

        if (ret < ZINT_ERROR) {
            assert_equal(symbol->rows, data[i].expected_rows, "i:%d symbol->rows %d != %d\n",
                        i, symbol->rows, data[i].expected_rows);
            assert_equal(symbol->width, data[i].expected_width, "i:%d symbol->width %d != %d\n",
                        i, symbol->width, data[i].expected_width);

            if (do_zxingcpp && testUtilCanZXingCPP(i, symbol, data_buf, length, debug)) {
                int cmp_len, ret_len;
                char modules_dump[4096];
                assert_notequal(testUtilModulesDump(symbol, modules_dump, sizeof(modules_dump)),-1,
                            "i:%d testUtilModulesDump == -1\n", i);
                ret = testUtilZXingCPP(i, symbol, data_buf, length, modules_dump, 3 /*zxingcpp_cmp*/, cmp_buf,
                            sizeof(cmp_buf), &cmp_len);
                assert_zero(ret, "i:%d %s testUtilZXingCPP ret %d != 0\n",
                            i, testUtilBarcodeName(symbol->symbology), ret);

                ret = testUtilZXingCPPCmp(symbol, cmp_msg, cmp_buf, cmp_len, data_buf, length,
                            NULL /*primary*/, ret_buf, &ret_len);
                assert_zero(ret, "i:%d %s testUtilZXingCPPCmp %d != 0 %s\n  actual: %s\nexpected: %s\n",
                            i, testUtilBarcodeName(symbol->symbology), ret, cmp_msg,
                            testUtilEscape(cmp_buf, cmp_len, escaped, sizeof(escaped)),
                            testUtilEscape(ret_buf, ret_len, escaped2, sizeof(escaped2)));
            }
        }

        ZBarcode_Delete(symbol);
    }

    testFinish();
}

static void test_hrt(const testCtx *const p_ctx) {
    int debug = p_ctx->debug;

    struct item {
        int symbology;
        int option_2;
        int output_options;
        const char *data;
        int length;

        const char *expected;
        int expected_length;
        const char *expected_content;
        int expected_content_length;
    };
    /* s/\/\*[ 0-9]*\*\//\=printf("\/\*%3d*\/", line(".") - line("'<")): */
    static const struct item data[] = {
        /*  0*/ { BARCODE_TELEPEN, -1, -1, "ABC1234.;$", -1, "ABC1234.;$", -1, "", -1 },
        /*  1*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "ABC1234.;$", -1, "ABC1234.;$", -1, "ABC1234.;$^", -1 },
        /*  2*/ { BARCODE_TELEPEN, -1, -1, "abc1234.;$", -1, "abc1234.;$", -1, "", -1 },
        /*  3*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "abc1234.;$", -1, "abc1234.;$", -1, "abc1234.;$}", -1 },
        /*  4*/ { BARCODE_TELEPEN, -1, -1, "ABC1234\001", -1, "ABC1234 ", -1, "", -1 }, /* Note used to put control chars (apart from NUL) in HRT */
        /*  5*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "ABC1234\001", -1, "ABC1234 ", -1, "ABC1234\001k", -1 },
        /*  6*/ { BARCODE_TELEPEN, -1, -1, "ABC\0001234", 8, "ABC 1234", -1, "", -1 },
        /*  7*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "ABC\0001234", 8, "ABC 1234", -1, "ABC\0001234l", 9 },
        /*  8*/ { BARCODE_TELEPEN, -1, -1, "ABK0", -1, "ABK0", -1, "", -1 },
        /*  9*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "ABK0", -1, "ABK0", -1, "ABK0\000", 5 },
        /* 10*/ { BARCODE_TELEPEN, -1, -1, "ABK0\020", -1, "ABK0 ", -1, "", -1 }, /* Trailing DLE is literal DLE, space in HRT */
        /* 11*/ { BARCODE_TELEPEN, -1, BARCODE_CONTENT_SEGS, "ABK0\020", -1, "ABK0 ", -1, "ABK0\020o", -1 },
        /* 12*/ { BARCODE_TELEPEN, 1, -1, "ABK0\020", -1, "ABK0", -1, "", -1 }, /* Trailing DLE in Full ASCII + Compressed Numeric mode, remove from HRT */
        /* 13*/ { BARCODE_TELEPEN, 1, BARCODE_CONTENT_SEGS, "ABK0\020", -1, "ABK0", -1, "ABK0\020o", -1 },
        /* 14*/ { BARCODE_TELEPEN, 1, -1, "ABC\0201234", -1, "ABC1234", -1, "", -1 }, /* Trailing numeric, no leading zero needed */
        /* 15*/ { BARCODE_TELEPEN, 1, BARCODE_CONTENT_SEGS, "ABC\0201234", -1, "ABC1234", -1, "ABC\0201234C", -1 },
        /* 16*/ { BARCODE_TELEPEN, 1, -1, "ABC\020123", -1, "ABC0123", -1, "", -1 }, /* Trailing numeric, add leading zero */
        /* 17*/ { BARCODE_TELEPEN, 1, BARCODE_CONTENT_SEGS, "ABC\020123", -1, "ABC0123", -1, "ABC\0200123Y", -1 },
        /* 18*/ { BARCODE_TELEPEN, 1, -1, "ABC\020123x", -1, "ABC123X", -1, "", -1 }, /* Converts to upper */
        /* 19*/ { BARCODE_TELEPEN, 1, BARCODE_CONTENT_SEGS, "ABC\020123x", -1, "ABC123X", -1, "ABC\020123Xl", -1 },
        /* 20*/ { BARCODE_TELEPEN_NUM, -1, -1, "1234", -1, "1234", -1, "", -1 },
        /* 21*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "1234", -1, "1234", -1, "1234\033", -1 },
        /* 22*/ { BARCODE_TELEPEN_NUM, -1, -1, "123X", -1, "123X", -1, "", -1 },
        /* 23*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "123X", -1, "123X", -1, "123XD", -1 },
        /* 24*/ { BARCODE_TELEPEN_NUM, -1, -1, "123x", -1, "123X", -1, "", -1 }, /* Converts to upper */
        /* 25*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "123x", -1, "123X", -1, "123XD", -1 },
        /* 26*/ { BARCODE_TELEPEN_NUM, -1, -1, "12345", -1, "012345", -1, "", -1 }, /* Adds leading zero if odd */
        /* 27*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "12345", -1, "012345", -1, "012345h", -1 },
        /* 28*/ { BARCODE_TELEPEN_NUM, -1, -1, "1234\0205", -1, "12345", -1, "", -1 }, /* Trailing ASCII, no leading zero needed */
        /* 29*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "1234\0205", -1, "12345", -1, "1234\0205U", -1 },
        /* 30*/ { BARCODE_TELEPEN_NUM, -1, -1, "123\020AB", -1, "0123AB", -1, "", -1 }, /* Trailing ASCII, add leading zero */
        /* 31*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "123\020AB", -1, "0123AB", -1, "0123\020AB\035", -1 },
        /* 32*/ { BARCODE_TELEPEN_NUM, -1, -1, "123\020", -1, "0123", -1, "", -1 }, /* Trailing DLE, remove from HRT */
        /* 33*/ { BARCODE_TELEPEN_NUM, -1, BARCODE_CONTENT_SEGS, "123\020", -1, "0123", -1, "0123\020!", -1 },
        /* 34*/ { BARCODE_TELEPEN_NUM, 1, -1, "12345", -1, "012345", -1, "", -1 },
        /* 35*/ { BARCODE_TELEPEN_NUM, 1, BARCODE_CONTENT_SEGS, "12345", -1, "012345", -1, "012345h", -1 },
        /* 36*/ { BARCODE_TELEPEN_NUM, 1, -1, "1234\020567", -1, "1234567", -1, "", -1 },
        /* 37*/ { BARCODE_TELEPEN_NUM, 1, BARCODE_CONTENT_SEGS, "1234\020567", -1, "1234567", -1, "1234\020567g", -1 },
        /* 38*/ { BARCODE_TELEPEN_NUM, 1, -1, "12345\020A", -1, "012345A", -1, "", -1 },
        /* 39*/ { BARCODE_TELEPEN_NUM, 1, BARCODE_CONTENT_SEGS, "12345\020A", -1, "012345A", -1, "012345\020A\027", -1 },
        /* 40*/ { BARCODE_TELEPEN_NUM, 1, -1, "123\020", -1, "0123", -1, "", -1 },
        /* 41*/ { BARCODE_TELEPEN_NUM, 1, BARCODE_CONTENT_SEGS, "123\020", -1, "0123", -1, "0123\020!", -1 },
    };
    const int data_size = ARRAY_SIZE(data);
    int i, length, ret;
    struct zint_symbol *symbol = NULL;
    int expected_length, expected_content_length;

    char escaped[1024];
    char escaped2[1024];
    char cmp_buf[8192];
    char cmp_msg[1024];
    char ret_buf[8192];

    /* Only do zxing-cpp tests if asked, too slow otherwise */
    int do_zxingcpp = (debug & ZINT_DEBUG_TEST_ZXINGCPP) && testUtilHaveZXingCPPDecoder();

    testStartSymbol(p_ctx->func_name, &symbol);

    for (i = 0; i < data_size; i++) {

        if (testContinue(p_ctx, i)) continue;

        symbol = ZBarcode_Create();
        assert_nonnull(symbol, "Symbol not created\n");

        length = testUtilSetSymbol(symbol, data[i].symbology, -1 /*input_mode*/, -1 /*eci*/,
                                    -1 /*option_1*/, data[i].option_2, -1 /*option_3*/, data[i].output_options,
                                    data[i].data, data[i].length, debug);
        expected_length = data[i].expected_length == -1 ? (int) strlen(data[i].expected) : data[i].expected_length;
        expected_content_length = data[i].expected_content_length == -1
                                    ? (int) strlen(data[i].expected_content) : data[i].expected_content_length;

        ret = ZBarcode_Encode(symbol, ZCUCP(data[i].data), length);
        assert_zero(ret, "i:%d ZBarcode_Encode ret %d != 0 %s\n", i, ret, symbol->errtxt);

        assert_equal(symbol->text_length, expected_length, "i:%d text_length %d != expected_length %d (%s, %s)\n",
                    i, symbol->text_length, expected_length,
                    testUtilEscape(ZCCP(symbol->text), symbol->text_length, escaped, sizeof(escaped)),
                    testUtilEscape(data[i].expected, expected_length, escaped2, sizeof(escaped2)));
        assert_zero(memcmp(symbol->text, data[i].expected, expected_length), "i:%d text memcmp(%s, %s, %d) != 0\n",
                    i, testUtilEscape(ZCCP(symbol->text), symbol->text_length, escaped, sizeof(escaped)),
                    testUtilEscape(data[i].expected, expected_length, escaped2, sizeof(escaped2)), expected_length);
        if (symbol->output_options & BARCODE_CONTENT_SEGS) {
            assert_nonnull(symbol->content_segs, "i:%d content_segs NULL\n", i);
            assert_nonnull(symbol->content_segs[0].source, "i:%d content_segs[0].source NULL\n", i);
            assert_equal(symbol->content_segs[0].length, expected_content_length,
                        "i:%d content_segs[0].length %d != expected_content_length %d (%s, %s)\n",
                        i, symbol->content_segs[0].length, expected_content_length,
                        testUtilEscape(ZCCP(symbol->content_segs[0].source), symbol->content_segs[0].length, escaped,
                                        sizeof(escaped)),
                        testUtilEscape(data[i].expected_content, expected_content_length, escaped2,
                                        sizeof(escaped2)));
            assert_zero(memcmp(symbol->content_segs[0].source, data[i].expected_content, expected_content_length),
                        "i:%d content_segs[0].source memcmp(%s, %s, %d) != 0\n", i,
                        testUtilEscape(ZCCP(symbol->content_segs[0].source), symbol->content_segs[0].length, escaped,
                                        sizeof(escaped)),
                        testUtilEscape(data[i].expected_content, expected_content_length, escaped2,
                                        sizeof(escaped2)), expected_content_length);
        } else {
            assert_null(symbol->content_segs, "i:%d content_segs not NULL\n", i);
        }

        if (do_zxingcpp && testUtilCanZXingCPP(i, symbol, data[i].data, length, debug)) {
            int cmp_len, ret_len;
            char modules_dump[4096];
            assert_notequal(testUtilModulesDump(symbol, modules_dump, sizeof(modules_dump)),-1,
                        "i:%d testUtilModulesDump == -1\n", i);
            ret = testUtilZXingCPP(i, symbol, data[i].data, length, modules_dump, 3 /*zxingcpp_cmp*/, cmp_buf,
                        sizeof(cmp_buf), &cmp_len);
            assert_zero(ret, "i:%d %s testUtilZXingCPP ret %d != 0\n",
                        i, testUtilBarcodeName(symbol->symbology), ret);

            ret = testUtilZXingCPPCmp(symbol, cmp_msg, cmp_buf, cmp_len, data[i].data, length,
                        NULL /*primary*/, ret_buf, &ret_len);
            assert_zero(ret, "i:%d %s testUtilZXingCPPCmp %d != 0 %s\n  actual: %s\nexpected: %s\n",
                        i, testUtilBarcodeName(symbol->symbology), ret, cmp_msg,
                        testUtilEscape(cmp_buf, cmp_len, escaped, sizeof(escaped)),
                        testUtilEscape(ret_buf, ret_len, escaped2, sizeof(escaped2)));
        }

        ZBarcode_Delete(symbol);
    }

    testFinish();
}

static void test_input(const testCtx *const p_ctx) {
    int debug = p_ctx->debug;

    struct item {
        int symbology;
        int option_2;
        const char *data;
        int length;
        int ret;
        int expected_rows;
        int expected_width;
        const char *expected_errtxt;
    };
    /* s/\/\*[ 0-9]*\*\//\=printf("\/\*%3d*\/", line(".") - line("'<")): */
    static const struct item data[] = {
        /*  0*/ { BARCODE_TELEPEN, -1, " !\"#$%&'()*+,-./0123456789:;<", -1, 0, 1, 512, "" },
        /*  1*/ { BARCODE_TELEPEN, -1, "AZaz\176\001", -1, 0, 1, 144, "" },
        /*  2*/ { BARCODE_TELEPEN, -1, "\000\177", 2, 0, 1, 80, "" },
        /*  3*/ { BARCODE_TELEPEN, -1, "é", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 391: Invalid character at position 1 in input, extended ASCII not allowed" },
        /*  4*/ { BARCODE_TELEPEN, -1, "\020", -1, 0, 1, 64, "" },
        /*  5*/ { BARCODE_TELEPEN, 1, "\020", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 397: DLE (ASCII 16) cannot be first character in Full ASCII + Compressed Numeric Mode" },
        /*  6*/ { BARCODE_TELEPEN, -1, "A\020B", -1, 0, 1, 96, "" },
        /*  7*/ { BARCODE_TELEPEN, 1, "A\020B", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 396: Invalid character at position 3 in input (digits and \"X\" only)" },
        /*  8*/ { BARCODE_TELEPEN, 1, "A\02012X3", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 394: Invalid odd position 4 of \"X\" in Telepen data" },
        /*  9*/ { BARCODE_TELEPEN_NUM, -1, "1234567890", -1, 0, 1, 128, "" },
        /* 10*/ { BARCODE_TELEPEN_NUM, -1, "123456789A", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 393: Invalid character at position 10 in input (digits and \"X\" only)" },
        /* 11*/ { BARCODE_TELEPEN_NUM, -1, "123456789X", -1, 0, 1, 128, "" }, /* [0-9]X allowed */
        /* 12*/ { BARCODE_TELEPEN_NUM, -1, "12345678X9", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 394: Invalid odd position 9 of \"X\" in Telepen data" }, /* X[0-9] not allowed */
        /* 13*/ { BARCODE_TELEPEN_NUM, -1, "1X34567X9X", -1, 0, 1, 128, "" }, /* [0-9]X allowed multiple times */
        /* 14*/ { BARCODE_TELEPEN_NUM, -1, "\020", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 398: DLE (ASCII 16) cannot be first character in Compressed Numeric Mode" },
        /* 15*/ { BARCODE_TELEPEN_NUM, 1, "\020", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 398: DLE (ASCII 16) cannot be first character in Compressed Numeric Mode" },
        /* 16*/ { BARCODE_TELEPEN_NUM, -1, "12\020é", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 395: Invalid character at position 4 in input, extended ASCII not allowed" },
        /* 17*/ { BARCODE_TELEPEN_NUM, 1, "12\020é", -1, ZINT_ERROR_INVALID_DATA, -1, -1, "Error 395: Invalid character at position 4 in input, extended ASCII not allowed" },
    };
    const int data_size = ARRAY_SIZE(data);
    int i, length, ret;
    struct zint_symbol *symbol = NULL;

    char escaped[1024];
    char escaped2[1024];
    char cmp_buf[8192];
    char cmp_msg[1024];
    char ret_buf[8192];

    /* Only do zxing-cpp tests if asked, too slow otherwise */
    int do_zxingcpp = (debug & ZINT_DEBUG_TEST_ZXINGCPP) && testUtilHaveZXingCPPDecoder();

    testStartSymbol(p_ctx->func_name, &symbol);

    for (i = 0; i < data_size; i++) {

        if (testContinue(p_ctx, i)) continue;

        symbol = ZBarcode_Create();
        assert_nonnull(symbol, "Symbol not created\n");

        length = testUtilSetSymbol(symbol, data[i].symbology, -1 /*input_mode*/, -1 /*eci*/,
                                    -1 /*option_1*/, data[i].option_2, -1, -1 /*output_options*/,
                                    data[i].data, data[i].length, debug);

        ret = ZBarcode_Encode(symbol, ZCUCP(data[i].data), length);
        assert_equal(ret, data[i].ret, "i:%d ZBarcode_Encode ret %d != %d (%s)\n",
                    i, ret, data[i].ret, symbol->errtxt);
        assert_equal(symbol->errtxt[0] == '\0', ret == 0, "i:%d symbol->errtxt not %s (%s)\n",
                    i, ret ? "set" : "empty", symbol->errtxt);
        assert_zero(strcmp(symbol->errtxt, data[i].expected_errtxt), "i:%d strcmp(%s, %s) != 0\n",
                    i, symbol->errtxt, data[i].expected_errtxt);

        if (ret < ZINT_ERROR) {
            assert_equal(symbol->rows, data[i].expected_rows, "i:%d symbol->rows %d != %d\n",
                        i, symbol->rows, data[i].expected_rows);
            assert_equal(symbol->width, data[i].expected_width, "i:%d symbol->width %d != %d\n",
                        i, symbol->width, data[i].expected_width);

            if (do_zxingcpp && testUtilCanZXingCPP(i, symbol, data[i].data, length, debug)) {
                int cmp_len, ret_len;
                char modules_dump[4096];
                assert_notequal(testUtilModulesDump(symbol, modules_dump, sizeof(modules_dump)),-1,
                            "i:%d testUtilModulesDump == -1\n", i);
                ret = testUtilZXingCPP(i, symbol, data[i].data, length, modules_dump, 3 /*zxingcpp_cmp*/, cmp_buf,
                            sizeof(cmp_buf), &cmp_len);
                assert_zero(ret, "i:%d %s testUtilZXingCPP ret %d != 0\n",
                            i, testUtilBarcodeName(symbol->symbology), ret);

                ret = testUtilZXingCPPCmp(symbol, cmp_msg, cmp_buf, cmp_len, data[i].data, length,
                            NULL /*primary*/, ret_buf, &ret_len);
                assert_zero(ret, "i:%d %s testUtilZXingCPPCmp %d != 0 %s\n  actual: %s\nexpected: %s\n",
                            i, testUtilBarcodeName(symbol->symbology), ret, cmp_msg,
                            testUtilEscape(cmp_buf, cmp_len, escaped, sizeof(escaped)),
                            testUtilEscape(ret_buf, ret_len, escaped2, sizeof(escaped2)));
            }
        }

        ZBarcode_Delete(symbol);
    }

    testFinish();
}

/* Telepen Barcode Symbology information and History (BSiH)
     https://advanova.co.uk/wp-content/uploads/2022/05/Barcode-Symbology-information-and-History.pdf */
/* E2326U: SB Telepen Fonts Guide. Issue 3 13/5/2022
     https://advanova.co.uk/wp-content/uploads/2022/05/SB-Telepen-Barcode-Fonts-V3.pdf */
static void test_encode(const testCtx *const p_ctx) {
    int debug = p_ctx->debug;

    struct item {
        int symbology;
        int option_2;
        const char *data;
        int length;
        int ret;

        int expected_rows;
        int expected_width;
        const char *comment;
        const char *expected;
    };
    /* s/\v(\/\*)[ 0-9]*(\*\/)/\=printf("%s%3d%s", submatch(1), (@z+setreg('z',@z+1)), submatch(2))/ | let @z=0: */
    static const struct item data[] = {
        /*  0*/ { BARCODE_TELEPEN, -1, "1A", -1, 0, 1, 80, "Telepen BSiH Example, same",
                    "10101010101110001011101000100010101110111011100010100010001110101110001010101010"
                },
        /*  1*/ { BARCODE_TELEPEN, -1, "ABC", -1, 0, 1, 96, "Telepen E2326U Example, same",
                    "101010101011100010111011101110001110001110111000101011101110101011101000101000101110001010101010"
                },
        /*  2*/ { BARCODE_TELEPEN, -1, "RST", -1, 0, 1, 96, "Verified manually against TEC-IT",
                    "101010101011100011100011100010101010111010111000111010111000101010111000111011101110001010101010"
                },
        /*  3*/ { BARCODE_TELEPEN, -1, "?@", -1, 0, 1, 80, "ASCII count 127, check 0; verified manually against TEC-IT",
                    "10101010101110001010101010101110111011101110101011101110111011101110001010101010"
                },
        /*  4*/ { BARCODE_TELEPEN, -1, "\000", 1, 0, 1, 64, "Verified manually against TEC-IT",
                    "1010101010111000111011101110111011101110111011101110001010101010"
                },
        /*  5*/ { BARCODE_TELEPEN, 1, "AB\0201234", -1, 0, 1, 128, "",
                    "10101011101010001011101110111000111000111011100011101110101110101010101110101110101000101010001010101011101110101110101000101010"
                },
        /*  6*/ { BARCODE_TELEPEN, 1, "AB\020123", -1, 0, 1, 128, "",
                    "10101011101010001011101110111000111000111011100011101110101110101110101010111010111000100010001010100010100011101110101000101010"
                },
        /*  7*/ { BARCODE_TELEPEN, 1, "AB\020", -1, 0, 1, 96, "",
                    "101010111010100010111011101110001110001110111000111011101011101010101110001010101110101000101010"
                },
        /*  8*/ { BARCODE_TELEPEN, 1, "AB", -1, 0, 1, 80, "",
                    "10101011101010001011101110111000111000111011100010101000101010001110101000101010"
                },
        /*  9*/ { BARCODE_TELEPEN_NUM, -1, "1234567890", -1, 0, 1, 128, "Verified manually against TEC-IT",
                    "10101010101110001010101110101110101000101010001010101110101110001011101010001000101110001010101010101011101010101110001010101010"
                },
        /* 10*/ { BARCODE_TELEPEN_NUM, -1, "123456789", -1, 0, 1, 128, "Verified manually against TEC-IT (012345679)",
                    "10101010101110001110101010111010111000100010001011101110001110001000101010001010111010100010100010111000101110101110001010101010"
                },
        /* 11*/ { BARCODE_TELEPEN_NUM, -1, "123X", -1, 0, 1, 80, "Verified manually against TEC-IT",
                    "10101010101110001010101110101110111010111000111011101011101110001110001010101010"
                },
        /* 12*/ { BARCODE_TELEPEN_NUM, -1, "1X3X", -1, 0, 1, 80, "Verified manually against TEC-IT",
                    "10101010101110001110001110001110111010111000111010111010101110001110001010101010"
                },
        /* 13*/ { BARCODE_TELEPEN_NUM, -1, "3637", -1, 0, 1, 80, "Glyph count 127, check 0; verified manually against TEC-IT",
                    "10101010101110001010101010101110111011101110101011101110111011101110001010101010"
                },
        /* 14*/ { BARCODE_TELEPEN_NUM, -1, "12\0203", -1, 0, 1, 96, "",
                    "101010101011100010101011101011101110111010111010101011101010111010111000101110101110001010101010"
                },
    };
    const int data_size = ARRAY_SIZE(data);
    int i, length, ret;
    struct zint_symbol *symbol = NULL;

    char escaped[1024];
    char escaped2[1024];
    char cmp_buf[8192];
    char cmp_msg[1024];
    char ret_buf[8192];

    /* Only do BWIPP/zxing-cpp tests if asked, too slow otherwise */
    int do_bwipp = (debug & ZINT_DEBUG_TEST_BWIPP) && testUtilHaveGhostscript();
    int do_zxingcpp = (debug & ZINT_DEBUG_TEST_ZXINGCPP) && testUtilHaveZXingCPPDecoder();

    testStartSymbol(p_ctx->func_name, &symbol);

    for (i = 0; i < data_size; i++) {

        if (testContinue(p_ctx, i)) continue;

        symbol = ZBarcode_Create();
        assert_nonnull(symbol, "Symbol not created\n");

        length = testUtilSetSymbol(symbol, data[i].symbology, -1 /*input_mode*/, -1 /*eci*/,
                                    -1 /*option_1*/, data[i].option_2, -1, -1 /*output_options*/,
                                    data[i].data, data[i].length, debug);

        ret = ZBarcode_Encode(symbol, ZCUCP(data[i].data), length);
        assert_equal(ret, data[i].ret, "i:%d ZBarcode_Encode ret %d != %d (%s)\n",
                    i, ret, data[i].ret, symbol->errtxt);

        if (p_ctx->generate) {
            printf("        /*%3d*/ { %s, %d, \"%s\", %d, %s, %d, %d, \"%s\",\n",
                    i, testUtilBarcodeName(data[i].symbology), data[i].option_2,
                    testUtilEscape(data[i].data, length, escaped, sizeof(escaped)), data[i].length,
                    testUtilErrorName(data[i].ret), symbol->rows, symbol->width, data[i].comment);
            testUtilModulesPrint(symbol, "                    ", "\n");
            printf("                },\n");
        } else {
            if (ret < ZINT_ERROR) {
                int width, row;

                assert_equal(symbol->rows, data[i].expected_rows, "i:%d symbol->rows %d != %d (%s)\n",
                            i, symbol->rows, data[i].expected_rows, data[i].data);
                assert_equal(symbol->width, data[i].expected_width, "i:%d symbol->width %d != %d (%s)\n",
                            i, symbol->width, data[i].expected_width, data[i].data);

                ret = testUtilModulesCmp(symbol, data[i].expected, &width, &row);
                assert_zero(ret, "i:%d testUtilModulesCmp ret %d != 0 width %d row %d (%s)\n",
                            i, ret, width, row, data[i].data);

                if (do_bwipp && testUtilCanBwipp(i, symbol, -1, data[i].option_2, -1, debug)) {
                    ret = testUtilBwipp(i, symbol, -1, data[i].option_2, -1, data[i].data, length, NULL, cmp_buf,
                                        sizeof(cmp_buf), NULL /*p_parsefnc*/);
                    assert_zero(ret, "i:%d %s testUtilBwipp ret %d != 0\n",
                                i, testUtilBarcodeName(symbol->symbology), ret);

                    ret = testUtilBwippCmp(symbol, cmp_msg, cmp_buf, data[i].expected);
                    assert_zero(ret, "i:%d %s testUtilBwippCmp %d != 0 %s\n  actual: %s\nexpected: %s\n",
                                i, testUtilBarcodeName(symbol->symbology), ret, cmp_msg, cmp_buf, data[i].expected);
                }
                if (do_zxingcpp && testUtilCanZXingCPP(i, symbol, data[i].data, length, debug)) {
                    int cmp_len, ret_len;
                    char modules_dump[4096];
                    assert_notequal(testUtilModulesDump(symbol, modules_dump, sizeof(modules_dump)),-1,
                                "i:%d testUtilModulesDump == -1\n", i);
                    ret = testUtilZXingCPP(i, symbol, data[i].data, length, modules_dump, 3 /*zxingcpp_cmp*/, cmp_buf,
                                sizeof(cmp_buf), &cmp_len);
                    assert_zero(ret, "i:%d %s testUtilZXingCPP ret %d != 0\n",
                                i, testUtilBarcodeName(symbol->symbology), ret);

                    ret = testUtilZXingCPPCmp(symbol, cmp_msg, cmp_buf, cmp_len, data[i].data, length,
                                NULL /*primary*/, ret_buf, &ret_len);
                    assert_zero(ret, "i:%d %s testUtilZXingCPPCmp %d != 0 %s\n  actual: %s\nexpected: %s\n",
                                i, testUtilBarcodeName(symbol->symbology), ret, cmp_msg,
                                testUtilEscape(cmp_buf, cmp_len, escaped, sizeof(escaped)),
                                testUtilEscape(ret_buf, ret_len, escaped2, sizeof(escaped2)));
                }
            }
        }

        ZBarcode_Delete(symbol);
    }

    testFinish();
}

/* #181 Nico Gunkel OSS-Fuzz */
static void test_fuzz(const testCtx *const p_ctx) {
    int debug = p_ctx->debug;

    struct item {
        int symbology;
        const char *data;
        int length;
        int ret;
    };
    /* Note NULs where using DELs code (16 binary characters wide) */
    /* s/\/\*[ 0-9]*\*\//\=printf("\/\*%3d*\/", line(".") - line("'<")): */
    static const struct item data[] = {
        /*  0*/ { BARCODE_TELEPEN, "\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000", 69, 0 },
        /*  1*/ { BARCODE_TELEPEN, "\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000", 70, ZINT_ERROR_TOO_LONG },
        /*  2*/ { BARCODE_TELEPEN_NUM, "\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000", 70, ZINT_ERROR_INVALID_DATA },
        /*  3*/ { BARCODE_TELEPEN_NUM, "0404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404", 136, 0 },
        /*  4*/ { BARCODE_TELEPEN_NUM, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567", 137, 0 },
        /*  5*/ { BARCODE_TELEPEN_NUM, "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000X", 136, 0 },
        /*  6*/ { BARCODE_TELEPEN_NUM, "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999", 136, 0 },
        /*  7*/ { BARCODE_TELEPEN_NUM, "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890", 4, 0 }, /* Length given, strlen > 137, so pseudo not NUL-terminated */
    };
    const int data_size = ARRAY_SIZE(data);
    int i, length, ret;
    struct zint_symbol *symbol = NULL;

    testStartSymbol(p_ctx->func_name, &symbol);

    for (i = 0; i < data_size; i++) {

        if (testContinue(p_ctx, i)) continue;

        symbol = ZBarcode_Create();
        assert_nonnull(symbol, "Symbol not created\n");

        symbol->symbology = data[i].symbology;
        symbol->debug |= debug;

        length = data[i].length == -1 ? (int) strlen(data[i].data) : data[i].length;

        ret = ZBarcode_Encode(symbol, ZCUCP(data[i].data), length);
        assert_equal(ret, data[i].ret, "i:%d ZBarcode_Encode ret %d != %d (%s)\n",
                    i, ret, data[i].ret, symbol->errtxt);

        ZBarcode_Delete(symbol);
    }

    testFinish();
}

/* Copy of "telepen.c" one */
static const char TeleTable[132][16] = {
    { "31313131"       }, { "1131313111"     }, { "33313111"              }, { "1111313131"             }, /*00-03*/
    { "3111313111"     }, { "11333131"       }, { "13133131"              }, { "111111313111"           }, /*04-07*/
    { "31333111"       }, { "1131113131"     }, { "33113131"              }, { "1111333111"             }, /*08-0B*/
    { "3111113131"     }, { "1113133111"     }, { "1311133111"            }, { "111111113131"           }, /*0C-0F*/
    { "3131113111"     }, { "11313331"       }, { "333331"                }, { "111131113111"           }, /*10-13*/
    { "31113331"       }, { "1133113111"     }, { "1313113111"            }, { "1111113331"             }, /*14-17*/
    { "31131331"       }, { "113111113111"   }, { "3311113111"            }, { "1111131331"             }, /*18-1B*/
    { "311111113111"   }, { "1113111331"     }, { "1311111331"            }, { "11111111113111"         }, /*1C-1F*/
    { "31313311"       }, { "1131311131"     }, { "33311131"              }, { "1111313311"             }, /*20-23*/
    { "3111311131"     }, { "11333311"       }, { "13133311"              }, { "111111311131"           }, /*24-27*/
    { "31331131"       }, { "1131113311"     }, { "33113311"              }, { "1111331131"             }, /*28-2B*/
    { "3111113311"     }, { "1113131131"     }, { "1311131131"            }, { "111111113311"           }, /*2C-2F*/
    { "3131111131"     }, { "1131131311"     }, { "33131311"              }, { "111131111131"           }, /*30-33*/
    { "3111131311"     }, { "1133111131"     }, { "1313111131"            }, { "111111131311"           }, /*34-37*/
    { "3113111311"     }, { "113111111131"   }, { "3311111131"            }, { "111113111311"           }, /*38-3B*/
    { "311111111131"   }, { "111311111311"   }, { "131111111311"          }, { "11111111111131"         }, /*3C-3F*/
    { "3131311111"     }, { "11313133"       }, { "333133"                }, { "111131311111"           }, /*40-43*/
    { "31113133"       }, { "1133311111"     }, { "1313311111"            }, { "1111113133"             }, /*44-47*/
    { "313333"         }, { "113111311111"   }, { "3311311111"            }, { "11113333"               }, /*48-4B*/
    { "311111311111"   }, { "11131333"       }, { "13111333"              }, { "11111111311111"         }, /*4C-4F*/
    { "31311133"       }, { "1131331111"     }, { "33331111"              }, { "1111311133"             }, /*50-53*/
    { "3111331111"     }, { "11331133"       }, { "13131133"              }, { "111111331111"           }, /*54-57*/
    { "3113131111"     }, { "1131111133"     }, { "33111133"              }, { "111113131111"           }, /*58-5B*/
    { "3111111133"     }, { "111311131111"   }, { "131111131111"          }, { "111111111133" /*START*/ }, /*5C-5F*/
    { "31311313"       }, { "113131111111"   }, { "3331111111"            }, { "1111311313"             }, /*60-63*/
    { "311131111111"   }, { "11331313"       }, { "13131313"              }, { "11111131111111"         }, /*64-67*/
    { "3133111111"     }, { "1131111313"     }, { "33111313"              }, { "111133111111"           }, /*68-6B*/
    { "3111111313"     }, { "111313111111"   }, { "131113111111"          }, { "111111111313"           }, /*6C-6F*/
    { "313111111111"   }, { "1131131113"     }, { "33131113"              }, { "11113111111111"         }, /*70-73*/
    { "3111131113"     }, { "113311111111"   }, { "131311111111"          }, { "111111131113"           }, /*74-77*/
    { "3113111113"     }, { "11311111111111" }, { "331111111111" /*STOP*/ }, { "111113111113"           }, /*78-7B*/
    { "31111111111111" }, { "111311111113"   }, { "131111111113"          },                               /*7C-7E*/
    {'1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1'},                                     /*7F*/
    { "111111113113" /*START 2*/ }, { "311311111111" /*STOP 2*/ },                                         /*80-81*/
    { "111111311113" /*START 3*/ }, { "311113111111" /*STOP 3*/ },                                         /*82-83*/
};

/* Dummy to generate lengths table */
static void test_generate_lens(const testCtx *const p_ctx) {

    int i;

    if (!p_ctx->generate) {
        return;
    }

    printf("static const char TeleLens[128] = {\n   ");
    for (i = 0; i < 127; i++) {
        if (i && (i % 16) == 0) {
            printf(" /*%02X-%02X*/\n    %2d,", i - 16, i - 1, (int) strlen(TeleTable[i]));
        } else {
            printf(" %2d,", (int) strlen(TeleTable[i]));
        }
    }
    printf(" 16  /*70-7F*/\n};\n");
    /* Not bothering with START/STOP 2/3 */
}

int main(int argc, char *argv[]) {

    testFunction funcs[] = { /* name, func */
        { "test_large", test_large },
        { "test_hrt", test_hrt },
        { "test_input", test_input },
        { "test_encode", test_encode },
        { "test_fuzz", test_fuzz },
        { "test_generate_lens", test_generate_lens },
    };

    testRun(argc, argv, funcs, ARRAY_SIZE(funcs));

    testReport();

    return 0;
}

/* vim: set ts=4 sw=4 et : */
