function f() {
    //
    // if
    //

    if (1)
        a, b;
    else if (2)
        c, d;
    else
        e, f;

    if (1) {
        a;
    } else
        b;

    //
    // for
    //

    for (;;) {
        a,
        b,
        c;
    }

    for (;;)
        c, d, e;

    //
    // for in
    //

    for (a in b) {
        a,
        b,
        c;
    }

    for (a in b)
        c, d, e;

    //
    // for of
    //

    for (a of b) {
        a,
        b,
        c;
    }

    for (a of b)
        c, d, e;

    //
    // while
    //

    while (1) {
        a,
        b,
        c;
    }

    while (1)
        a, b, c;

    //
    // do while
    //

    do {
        a,
        b,
        c;
    } while (1);

    do
        a, b, c;
    while (1);

    //
    // booleans
    //

    !0;
    !1;

    a = !0;
    b = !1;

    return !0;
    return !1;

    !0, !1, !2;

    [!0, !1, true, false, 0, 1, 1 + 1, !0 && !1];

    ++i;
    --i;

    + 0; - 0;

    //
    // return
    //

    return a;
    return a, (b, c);
    return a, b, c;

    //
    // Other
    //

    a, b;
    c, d;
    e, f;
}
