function foo (x) {
    var tmp = 3,
        tmp2 = 2;

    function bar (y) {
        ++tmp;
        function baz (z) {
            document.write(x + y + z + tmp);
        }
        baz(3);
    }
    bar(10);

    function foobar (y) {
        --tmp2;
        function haz (z) {
            document.write(x + y + z + tmp);
        }
        haz(3);
    }
    foobar(5);
}

foo(2);
