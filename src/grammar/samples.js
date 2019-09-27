export const CD19 = `
<program> ::= CD19 <id> <consts> <types> <arrays> <funcs> <mainbody>
<consts> ::= constants <initlist> | ε
<initlist> ::= <init> | <init> , <initlist>
<init> ::= <id> = <expr>
<types> ::= types <typelist> | ε
<arrays> ::= arrays <arrdecls> | ε
<funcs> ::= <func> <funcs> | ε
<mainbody> ::= main <slist> begin <stats> end CD19 <id>
<slist> ::= <sdecl> | <sdecl> , <slist>
<typelist> ::= <type> <typelist> | <type>
<type> ::= <structid> is <fields> end
<type> ::= <typeid> is array [ <expr> ] of <structid>
<fields> ::= <sdecl> | <sdecl> , <fields>
<sdecl> ::= <id> : <stype>
<arrdecls> ::= <arrdecl> | <arrdecl> , <arrdecls>
<arrdecl> ::= <id> : <typeid>
<func> ::= function <id> ( <plist> ) : <rtype> <funcbody>
<rtype> ::= <stype> | void
<plist> ::= <params> | ε
<params> ::= <param> , <params> | <param>
<param> ::= <sdecl> | <arrdecl> | const <arrdecl>
<funcbody> ::= <locals> begin <stats> end
<locals> ::= <dlist> | ε
<dlist> ::= <decl> | <decl> , <dlist>
<decl> ::= <sdecl> | <arrdecl>
<stype> ::= integer | real | boolean
<stats> ::= <stat> ; <stats> | <strstat> <stats> | <stat>; | <strstat>
<strstat> ::= <forstat> | <ifstat>
<stat> ::= <repstat> | <asgnstat> | <iostat> | <callstat> | <returnstat>
<forstat> ::= for ( <asgnlist> ; <bool> ) <stats> end
<repstat> ::= repeat ( <asgnlist> ) <stats> until <bool>
<asgnlist> ::= <alist> | ε
<alist> ::= <asgnstat> | <asgnstat> , <alist>
<ifstat> ::= if ( <bool> ) <stats> end
<ifstat> ::= if ( <bool> ) <stats> else <stats> end
<asgnstat> ::= <var> <asgnop> <bool>
<asgnop> ::= = | += | -= | *= | /=
<iostat> ::= input <vlist> | print <prlist> | printline <prlist>
<callstat> ::= <id> ( <elist> ) | <id> ( )
<returnstat> ::= return | return <expr>
<vlist> ::= <var> , <vlist> | <var>
<var> ::= <id> | <id>[<expr>] . <id>
<elist> ::= <bool> , <elist> | <bool>
<bool> ::= <bool> <logop> <rel> | <rel>
<rel> ::= not <expr> <relop> <expr> | <expr> <relop> <expr> | <expr>
<logop> ::= and | or | xor
<relop> ::= == | != | > | <= | < | >=
<expr> ::= <expr> + <fact> | <expr> - <fact> | <fact>
<fact> ::= <fact> * <term> | <fact> / <term> | <fact> % <term> | <term>
<term> ::= <term> ^ <exponent> | <exponent>
<exponent> ::= <var> | <intlit> | <reallit> | <fncall> | true | false
<exponent> ::= ( <bool> )
<fncall> ::= <id> ( <elist> ) | <id> ( )
<prlist> ::= <printitem> , <prlist> | <printitem>
<printitem> ::= <expr> | <string>
<id> ::= id
<structid> ::= id
<typeid> ::= id
<intlit> ::= 42
<reallit> ::= 0.0000001000000100000110
<string> ::= "oh hai mark"
`.trim()

export const CircularLeftRecursion = `
<a> ::= <b> <a> | a | ε
<b> ::= <c> | b | ε
<c> ::= c | ε | <d>
<d> ::= d | <a> d | <b> d | <e> | ε
<e> ::= a <e> | e | ε
`.trim()

export const FirstAndFollow = `
<E> ::= <T> <E'>
<E'> ::= + <T> <E'>
<E'> ::= ε
<T> ::= <F> <T'>
<T'> ::= * <F> <T'>
<T'> ::= ε
<F> ::= (<E>)
<F> ::= id
`.trim()

export const FirstAndFollow2 = `
<S> ::= <A> <B> <C> | <A> <D>
<A> ::= ε | a <A>
<B> ::= b | c | ε
<C> ::= <D> d <C>
<D> ::= e b | f c
`.trim()
