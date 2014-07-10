function foo (x) {
    var tmp = 3;
    function bar (y) {
        ++tmp;
        function baz (z) {
            document.write(x + y + z + tmp);
        }
        baz(3);
    }
    bar(10);
}

foo(2);
