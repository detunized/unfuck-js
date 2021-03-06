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

    /* ES6
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
    */

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
    // void 0
    //

    void 0;
    if (void 0 === a)
        b;

    //
    // return
    //

    return a;
    return a, (b, c);
    return a, b, c;

    //
    // return
    //

    throw a;
    throw a, (b, c);
    throw a, b, c;

    //
    // var
    //

    var a;
    var a, b;
    var a = 1;
    var a = 1,
        b = 2;
    var a = 1,
        b = 2,
        c, d = 3,
        e = a + b + c;

    /* ES6
    let a;
    let a, b;
    let a = 1;
    let a = 1,
        b = 2;
    let a = 1,
        b = 2,
        c, d = 3,
        e = a + b + c;

    const a = 1;
    const a = 1,
        b = 2;
    const a = 1,
        b = 2,
        c = a + b,
        d = 3,
        e = a + b + c;
    */

    //
    // commas
    //

    a, b;
    c, d;
    e, f, g;
    e, (f, g), h = 1, d, (i = j, a = k);

    //
    // && -> if
    //

    a && b;
    a && b && c;

    switch (a) {
        case 1:
            b && c;
            d && e;
            break;
        case 2:
            a;
            b && c && d;
            d;
            break;
    }

    if (a && b) {}
    for (a && b; b && c; d && e) {}

    /* ES6
    x => a && b;
    */

    //
    // || -> if
    //

    a || b;
    a && b || c;
    a || b || c;
    a || b && c;

    switch (a) {
        case 1:
            b || c;
            d || e;
            break;
        case 2:
            a;
            b || c || d;
            d;
            break;
    }

    if (a || b) {}
    for (a || b; b || c; d || e) {}

    /* ES6
    x => a || b;
    */

    //
    // ?:
    //

    a ? b : c;
    e = a ? b : c;

    //
    // return a ? b : c;
    //

    return;
    return a;
    return a ? b : c;
}

// Problems
void 0 === f && (f = 64);
