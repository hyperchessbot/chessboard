var Chessops = (function (result_1) {
  "use strict";

  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { default: e };
  }

  var result_1__default = /*#__PURE__*/ _interopDefaultLegacy(result_1);

  function getDefaultExportFromCjs(x) {
    return x &&
      x.__esModule &&
      Object.prototype.hasOwnProperty.call(x, "default")
      ? x["default"]
      : x;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
    return fn(module, module.exports), module.exports;
  }

  var types = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RULES = exports.isNormal = exports.isDrop = exports.CASTLING_SIDES = exports.ROLES = exports.COLORS = exports.RANK_NAMES = exports.FILE_NAMES = void 0;
    exports.FILE_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"];
    exports.RANK_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];
    exports.COLORS = ["white", "black"];
    exports.ROLES = ["pawn", "knight", "bishop", "rook", "queen", "king"];
    exports.CASTLING_SIDES = ["a", "h"];
    function isDrop(v) {
      return "role" in v;
    }
    exports.isDrop = isDrop;
    function isNormal(v) {
      return "from" in v;
    }
    exports.isNormal = isNormal;
    exports.RULES = [
      "chess",
      "antichess",
      "kingofthehill",
      "3check",
      "atomic",
      "horde",
      "racingkings",
      "crazyhouse",
    ];
  });

  var util = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeUci = exports.parseUci = exports.makeSquare = exports.parseSquare = exports.charToRole = exports.roleToChar = exports.squareFile = exports.squareRank = exports.opposite = exports.defined = void 0;

    function defined(v) {
      return v !== undefined;
    }
    exports.defined = defined;
    function opposite(color) {
      return color === "white" ? "black" : "white";
    }
    exports.opposite = opposite;
    function squareRank(square) {
      return square >> 3;
    }
    exports.squareRank = squareRank;
    function squareFile(square) {
      return square & 0x7;
    }
    exports.squareFile = squareFile;
    function roleToChar(role) {
      switch (role) {
        case "pawn":
          return "p";
        case "knight":
          return "n";
        case "bishop":
          return "b";
        case "rook":
          return "r";
        case "queen":
          return "q";
        case "king":
          return "k";
      }
    }
    exports.roleToChar = roleToChar;
    function charToRole(ch) {
      switch (ch) {
        case "P":
        case "p":
          return "pawn";
        case "N":
        case "n":
          return "knight";
        case "B":
        case "b":
          return "bishop";
        case "R":
        case "r":
          return "rook";
        case "Q":
        case "q":
          return "queen";
        case "K":
        case "k":
          return "king";
        default:
          return;
      }
    }
    exports.charToRole = charToRole;
    function parseSquare(str) {
      if (str.length !== 2) return;
      const file = str.charCodeAt(0) - "a".charCodeAt(0);
      const rank = str.charCodeAt(1) - "1".charCodeAt(0);
      if (file < 0 || file >= 8 || rank < 0 || rank >= 8) return;
      return file + 8 * rank;
    }
    exports.parseSquare = parseSquare;
    function makeSquare(square) {
      return (
        types.FILE_NAMES[squareFile(square)] +
        types.RANK_NAMES[squareRank(square)]
      );
    }
    exports.makeSquare = makeSquare;
    function parseUci(str) {
      if (str[1] === "@" && str.length === 4) {
        const role = charToRole(str[0]);
        const to = parseSquare(str.slice(2));
        if (role && defined(to)) return { role, to };
      } else if (str.length === 4 || str.length === 5) {
        const from = parseSquare(str.slice(0, 2));
        const to = parseSquare(str.slice(2, 4));
        let promotion;
        if (str.length === 5) {
          promotion = charToRole(str[4]);
          if (!promotion) return;
        }
        if (defined(from) && defined(to)) return { from, to, promotion };
      }
      return;
    }
    exports.parseUci = parseUci;
    /**
     * Converts a move to UCI notation, like `g1f3` for a normal move,
     * `a7a8q` for promotion to a queen, and `Q@f7` for a Crazyhouse drop.
     */
    function makeUci(move) {
      if (types.isDrop(move))
        return `${roleToChar(move.role).toUpperCase()}@${makeSquare(move.to)}`;
      return (
        makeSquare(move.from) +
        makeSquare(move.to) +
        (move.promotion ? roleToChar(move.promotion) : "")
      );
    }
    exports.makeUci = makeUci;
  });

  var squareSet = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SquareSet = void 0;
    function popcnt32(n) {
      n = n - ((n >>> 1) & 1431655765);
      n = (n & 858993459) + ((n >>> 2) & 858993459);
      return Math.imul((n + (n >>> 4)) & 252645135, 16843009) >> 24;
    }
    function bswap32(n) {
      n = ((n >>> 8) & 16711935) | ((n & 16711935) << 8);
      return ((n >>> 16) & 0xffff) | ((n & 0xffff) << 16);
    }
    function rbit32(n) {
      n = ((n >>> 1) & 1431655765) | ((n & 1431655765) << 1);
      n = ((n >>> 2) & 858993459) | ((n & 858993459) << 2);
      n = ((n >>> 4) & 252645135) | ((n & 252645135) << 4);
      return bswap32(n);
    }
    class SquareSet {
      constructor(lo, hi) {
        this.lo = lo;
        this.hi = hi;
        this.lo = lo | 0;
        this.hi = hi | 0;
      }
      static fromSquare(square) {
        return square >= 32
          ? new SquareSet(0, 1 << (square - 32))
          : new SquareSet(1 << square, 0);
      }
      static fromRank(rank) {
        return new SquareSet(0xff, 0).shl64(8 * rank);
      }
      static fromFile(file) {
        return new SquareSet(16843009 << file, 16843009 << file);
      }
      static empty() {
        return new SquareSet(0, 0);
      }
      static full() {
        return new SquareSet(4294967295, 4294967295);
      }
      static corners() {
        return new SquareSet(0x81, 2164260864);
      }
      static center() {
        return new SquareSet(402653184, 0x18);
      }
      static backranks() {
        return new SquareSet(0xff, 4278190080);
      }
      static backrank(color) {
        return color === "white"
          ? new SquareSet(0xff, 0)
          : new SquareSet(0, 4278190080);
      }
      static lightSquares() {
        return new SquareSet(1437226410, 1437226410);
      }
      static darkSquares() {
        return new SquareSet(2857740885, 2857740885);
      }
      complement() {
        return new SquareSet(~this.lo, ~this.hi);
      }
      xor(other) {
        return new SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
      }
      union(other) {
        return new SquareSet(this.lo | other.lo, this.hi | other.hi);
      }
      intersect(other) {
        return new SquareSet(this.lo & other.lo, this.hi & other.hi);
      }
      diff(other) {
        return new SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
      }
      intersects(other) {
        return this.intersect(other).nonEmpty();
      }
      isDisjoint(other) {
        return this.intersect(other).isEmpty();
      }
      supersetOf(other) {
        return other.diff(this).isEmpty();
      }
      subsetOf(other) {
        return this.diff(other).isEmpty();
      }
      shr64(shift) {
        if (shift >= 64) return SquareSet.empty();
        if (shift >= 32) return new SquareSet(this.hi >>> (shift - 32), 0);
        if (shift > 0)
          return new SquareSet(
            (this.lo >>> shift) ^ (this.hi << (32 - shift)),
            this.hi >>> shift
          );
        return this;
      }
      shl64(shift) {
        if (shift >= 64) return SquareSet.empty();
        if (shift >= 32) return new SquareSet(0, this.lo << (shift - 32));
        if (shift > 0)
          return new SquareSet(
            this.lo << shift,
            (this.hi << shift) ^ (this.lo >>> (32 - shift))
          );
        return this;
      }
      bswap64() {
        return new SquareSet(bswap32(this.hi), bswap32(this.lo));
      }
      rbit64() {
        return new SquareSet(rbit32(this.hi), rbit32(this.lo));
      }
      minus64(other) {
        const lo = this.lo - other.lo;
        const c = ((lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1)) >>> 31;
        return new SquareSet(lo, this.hi - (other.hi + c));
      }
      equals(other) {
        return this.lo === other.lo && this.hi === other.hi;
      }
      size() {
        return popcnt32(this.lo) + popcnt32(this.hi);
      }
      isEmpty() {
        return this.lo === 0 && this.hi === 0;
      }
      nonEmpty() {
        return this.lo !== 0 || this.hi !== 0;
      }
      has(square) {
        return (
          (square >= 32
            ? this.hi & (1 << (square - 32))
            : this.lo & (1 << square)) !== 0
        );
      }
      set(square, on) {
        return on ? this.with(square) : this.without(square);
      }
      with(square) {
        return square >= 32
          ? new SquareSet(this.lo, this.hi | (1 << (square - 32)))
          : new SquareSet(this.lo | (1 << square), this.hi);
      }
      without(square) {
        return square >= 32
          ? new SquareSet(this.lo, this.hi & ~(1 << (square - 32)))
          : new SquareSet(this.lo & ~(1 << square), this.hi);
      }
      toggle(square) {
        return square >= 32
          ? new SquareSet(this.lo, this.hi ^ (1 << (square - 32)))
          : new SquareSet(this.lo ^ (1 << square), this.hi);
      }
      last() {
        if (this.hi !== 0) return 63 - Math.clz32(this.hi);
        if (this.lo !== 0) return 31 - Math.clz32(this.lo);
        return;
      }
      first() {
        if (this.lo !== 0) return 31 - Math.clz32(this.lo & -this.lo);
        if (this.hi !== 0) return 63 - Math.clz32(this.hi & -this.hi);
        return;
      }
      withoutFirst() {
        if (this.lo !== 0)
          return new SquareSet(this.lo & (this.lo - 1), this.hi);
        return new SquareSet(0, this.hi & (this.hi - 1));
      }
      moreThanOne() {
        return (
          (this.hi !== 0 && this.lo !== 0) ||
          (this.lo & (this.lo - 1)) !== 0 ||
          (this.hi & (this.hi - 1)) !== 0
        );
      }
      singleSquare() {
        return this.moreThanOne() ? undefined : this.last();
      }
      isSingleSquare() {
        return this.nonEmpty() && !this.moreThanOne();
      }
      *[Symbol.iterator]() {
        let lo = this.lo;
        let hi = this.hi;
        while (lo !== 0) {
          const idx = 31 - Math.clz32(lo & -lo);
          lo ^= 1 << idx;
          yield idx;
        }
        while (hi !== 0) {
          const idx = 31 - Math.clz32(hi & -hi);
          hi ^= 1 << idx;
          yield 32 + idx;
        }
      }
      *reversed() {
        let lo = this.lo;
        let hi = this.hi;
        while (hi !== 0) {
          const idx = 31 - Math.clz32(hi);
          hi ^= 1 << idx;
          yield 32 + idx;
        }
        while (lo !== 0) {
          const idx = 31 - Math.clz32(lo);
          lo ^= 1 << idx;
          yield idx;
        }
      }
    }
    exports.SquareSet = SquareSet;
  });

  var attacks_1 = createCommonjsModule(function (module, exports) {
    /**
     * Compute attacks and rays.
     *
     * These are low-level functions that can be used to implement chess rules.
     *
     * Implementation notes: Sliding attacks are computed using
     * [hyperbola quintessence](https://www.chessprogramming.org/Hyperbola_Quintessence).
     * Magic bitboards would deliver faster lookups, but also require
     * initializing considerably larger attack tables. On the web, initialization
     * time is important, so the chosen method may strike a better balance.
     *
     * @packageDocumentation
     */
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.between = exports.ray = exports.attacks = exports.queenAttacks = exports.rookAttacks = exports.bishopAttacks = exports.pawnAttacks = exports.knightAttacks = exports.kingAttacks = void 0;

    function computeRange(square, deltas) {
      let range = squareSet.SquareSet.empty();
      for (const delta of deltas) {
        const sq = square + delta;
        if (
          0 <= sq &&
          sq < 64 &&
          Math.abs(util.squareFile(square) - util.squareFile(sq)) <= 2
        ) {
          range = range.with(sq);
        }
      }
      return range;
    }
    function tabulate(f) {
      const table = [];
      for (let square = 0; square < 64; square++) table[square] = f(square);
      return table;
    }
    const KING_ATTACKS = tabulate((sq) =>
      computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9])
    );
    const KNIGHT_ATTACKS = tabulate((sq) =>
      computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17])
    );
    const PAWN_ATTACKS = {
      white: tabulate((sq) => computeRange(sq, [7, 9])),
      black: tabulate((sq) => computeRange(sq, [-7, -9])),
    };
    /**
     * Gets squares attacked or defended by a king on `square`.
     */
    function kingAttacks(square) {
      return KING_ATTACKS[square];
    }
    exports.kingAttacks = kingAttacks;
    /**
     * Gets squares attacked or defended by a knight on `square`.
     */
    function knightAttacks(square) {
      return KNIGHT_ATTACKS[square];
    }
    exports.knightAttacks = knightAttacks;
    /**
     * Gets squares attacked or defended by a pawn of the given `color`
     * on `square`.
     */
    function pawnAttacks(color, square) {
      return PAWN_ATTACKS[color][square];
    }
    exports.pawnAttacks = pawnAttacks;
    const FILE_RANGE = tabulate((sq) =>
      squareSet.SquareSet.fromFile(util.squareFile(sq)).without(sq)
    );
    const RANK_RANGE = tabulate((sq) =>
      squareSet.SquareSet.fromRank(util.squareRank(sq)).without(sq)
    );
    const DIAG_RANGE = tabulate((sq) => {
      const diag = new squareSet.SquareSet(134480385, 2151686160);
      const shift = 8 * (util.squareRank(sq) - util.squareFile(sq));
      return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
    });
    const ANTI_DIAG_RANGE = tabulate((sq) => {
      const diag = new squareSet.SquareSet(270549120, 16909320);
      const shift = 8 * (util.squareRank(sq) + util.squareFile(sq) - 7);
      return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
    });
    function hyperbola(bit, range, occupied) {
      let forward = occupied.intersect(range);
      let reverse = forward.bswap64(); // Assumes no more than 1 bit per rank
      forward = forward.minus64(bit);
      reverse = reverse.minus64(bit.bswap64());
      return forward.xor(reverse.bswap64()).intersect(range);
    }
    function fileAttacks(square, occupied) {
      return hyperbola(
        squareSet.SquareSet.fromSquare(square),
        FILE_RANGE[square],
        occupied
      );
    }
    function rankAttacks(square, occupied) {
      const range = RANK_RANGE[square];
      let forward = occupied.intersect(range);
      let reverse = forward.rbit64();
      forward = forward.minus64(squareSet.SquareSet.fromSquare(square));
      reverse = reverse.minus64(squareSet.SquareSet.fromSquare(63 - square));
      return forward.xor(reverse.rbit64()).intersect(range);
    }
    /**
     * Gets squares attacked or defended by a bishop on `square`, given `occupied`
     * squares.
     */
    function bishopAttacks(square, occupied) {
      const bit = squareSet.SquareSet.fromSquare(square);
      return hyperbola(bit, DIAG_RANGE[square], occupied).xor(
        hyperbola(bit, ANTI_DIAG_RANGE[square], occupied)
      );
    }
    exports.bishopAttacks = bishopAttacks;
    /**
     * Gets squares attacked or defended by a rook on `square`, given `occupied`
     * squares.
     */
    function rookAttacks(square, occupied) {
      return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
    }
    exports.rookAttacks = rookAttacks;
    /**
     * Gets squares attacked or defended by a queen on `square`, given `occupied`
     * squares.
     */
    function queenAttacks(square, occupied) {
      return bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
    }
    exports.queenAttacks = queenAttacks;
    /**
     * Gets squares attacked or defended by a `piece` on `square`, given
     * `occupied` squares.
     */
    function attacks(piece, square, occupied) {
      switch (piece.role) {
        case "pawn":
          return pawnAttacks(piece.color, square);
        case "knight":
          return knightAttacks(square);
        case "bishop":
          return bishopAttacks(square, occupied);
        case "rook":
          return rookAttacks(square, occupied);
        case "queen":
          return queenAttacks(square, occupied);
        case "king":
          return kingAttacks(square);
      }
    }
    exports.attacks = attacks;
    /**
     * Gets all squares of the rank, file or diagonal with the two squares
     * `a` and `b`, or an empty set if they are not aligned.
     */
    function ray(a, b) {
      const other = squareSet.SquareSet.fromSquare(b);
      if (RANK_RANGE[a].intersects(other)) return RANK_RANGE[a].with(a);
      if (ANTI_DIAG_RANGE[a].intersects(other))
        return ANTI_DIAG_RANGE[a].with(a);
      if (DIAG_RANGE[a].intersects(other)) return DIAG_RANGE[a].with(a);
      if (FILE_RANGE[a].intersects(other)) return FILE_RANGE[a].with(a);
      return squareSet.SquareSet.empty();
    }
    exports.ray = ray;
    /**
     * Gets all squares between `a` and `b` (bounds not included), or an empty set
     * if they are not on the same rank, file or diagonal.
     */
    function between(a, b) {
      return ray(a, b)
        .intersect(
          squareSet.SquareSet.full()
            .shl64(a)
            .xor(squareSet.SquareSet.full().shl64(b))
        )
        .withoutFirst();
    }
    exports.between = between;
  });

  var board = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Board = void 0;

    /**
     * Piece positions on a board.
     *
     * Properties are sets of squares, like `board.occupied` for all occupied
     * squares, `board[color]` for all pieces of that color, and `board[role]`
     * for all pieces of that role. When modifying the properties directly, take
     * care to keep them consistent.
     */
    class Board {
      constructor() {}
      static default() {
        const board = new Board();
        board.reset();
        return board;
      }
      static racingKings() {
        const board = new Board();
        board.occupied = new squareSet.SquareSet(0xffff, 0);
        board.promoted = squareSet.SquareSet.empty();
        board.white = new squareSet.SquareSet(0xf0f0, 0);
        board.black = new squareSet.SquareSet(0x0f0f, 0);
        board.pawn = squareSet.SquareSet.empty();
        board.knight = new squareSet.SquareSet(0x1818, 0);
        board.bishop = new squareSet.SquareSet(0x2424, 0);
        board.rook = new squareSet.SquareSet(0x4242, 0);
        board.queen = new squareSet.SquareSet(0x0081, 0);
        board.king = new squareSet.SquareSet(0x8100, 0);
        return board;
      }
      static horde() {
        const board = new Board();
        board.occupied = new squareSet.SquareSet(4294967295, 4294901862);
        board.promoted = squareSet.SquareSet.empty();
        board.white = new squareSet.SquareSet(4294967295, 102);
        board.black = new squareSet.SquareSet(0, 4294901760);
        board.pawn = new squareSet.SquareSet(4294967295, 16711782);
        board.knight = new squareSet.SquareSet(0, 1107296256);
        board.bishop = new squareSet.SquareSet(0, 603979776);
        board.rook = new squareSet.SquareSet(0, 2164260864);
        board.queen = new squareSet.SquareSet(0, 134217728);
        board.king = new squareSet.SquareSet(0, 268435456);
        return board;
      }
      /**
       * Resets all pieces to the default starting position for standard chess.
       */
      reset() {
        this.occupied = new squareSet.SquareSet(0xffff, 4294901760);
        this.promoted = squareSet.SquareSet.empty();
        this.white = new squareSet.SquareSet(0xffff, 0);
        this.black = new squareSet.SquareSet(0, 4294901760);
        this.pawn = new squareSet.SquareSet(0xff00, 16711680);
        this.knight = new squareSet.SquareSet(0x42, 1107296256);
        this.bishop = new squareSet.SquareSet(0x24, 603979776);
        this.rook = new squareSet.SquareSet(0x81, 2164260864);
        this.queen = new squareSet.SquareSet(0x8, 134217728);
        this.king = new squareSet.SquareSet(0x10, 268435456);
      }
      static empty() {
        const board = new Board();
        board.clear();
        return board;
      }
      clear() {
        this.occupied = squareSet.SquareSet.empty();
        this.promoted = squareSet.SquareSet.empty();
        for (const color of types.COLORS)
          this[color] = squareSet.SquareSet.empty();
        for (const role of types.ROLES)
          this[role] = squareSet.SquareSet.empty();
      }
      clone() {
        const board = new Board();
        board.occupied = this.occupied;
        board.promoted = this.promoted;
        for (const color of types.COLORS) board[color] = this[color];
        for (const role of types.ROLES) board[role] = this[role];
        return board;
      }
      equalsIgnorePromoted(other) {
        if (!this.white.equals(other.white)) return false;
        return types.ROLES.every((role) => this[role].equals(other[role]));
      }
      equals(other) {
        return (
          this.equalsIgnorePromoted(other) &&
          this.promoted.equals(other.promoted)
        );
      }
      getColor(square) {
        if (this.white.has(square)) return "white";
        if (this.black.has(square)) return "black";
        return;
      }
      getRole(square) {
        for (const role of types.ROLES) {
          if (this[role].has(square)) return role;
        }
        return;
      }
      get(square) {
        const color = this.getColor(square);
        if (!color) return;
        const role = this.getRole(square);
        const promoted = this.promoted.has(square);
        return { color, role, promoted };
      }
      /**
       * Removes and returns the piece from the given `square`, if any.
       */
      take(square) {
        const piece = this.get(square);
        if (piece) {
          this.occupied = this.occupied.without(square);
          this[piece.color] = this[piece.color].without(square);
          this[piece.role] = this[piece.role].without(square);
          if (piece.promoted) this.promoted = this.promoted.without(square);
        }
        return piece;
      }
      /**
       * Put `piece` onto `square`, potentially replacing an existing piece.
       * Returns the existing piece, if any.
       */
      set(square, piece) {
        const old = this.take(square);
        this.occupied = this.occupied.with(square);
        this[piece.color] = this[piece.color].with(square);
        this[piece.role] = this[piece.role].with(square);
        if (piece.promoted) this.promoted = this.promoted.with(square);
        return old;
      }
      has(square) {
        return this.occupied.has(square);
      }
      *[Symbol.iterator]() {
        for (const square of this.occupied) {
          yield [square, this.get(square)];
        }
      }
      pieces(color, role) {
        return this[color].intersect(this[role]);
      }
      rooksAndQueens() {
        return this.rook.union(this.queen);
      }
      bishopsAndQueens() {
        return this.bishop.union(this.queen);
      }
      /**
       * Finds the unique unpromoted king of the given `color`, if any.
       */
      kingOf(color) {
        return this.king
          .intersect(this[color])
          .diff(this.promoted)
          .singleSquare();
      }
    }
    exports.Board = Board;
  });

  var setup = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultSetup = exports.RemainingChecks = exports.Material = exports.MaterialSide = void 0;

    class MaterialSide {
      constructor() {}
      static empty() {
        const m = new MaterialSide();
        for (const role of types.ROLES) m[role] = 0;
        return m;
      }
      static fromBoard(board, color) {
        const m = new MaterialSide();
        for (const role of types.ROLES)
          m[role] = board.pieces(color, role).size();
        return m;
      }
      clone() {
        const m = new MaterialSide();
        for (const role of types.ROLES) m[role] = this[role];
        return m;
      }
      equals(other) {
        return types.ROLES.every((role) => this[role] === other[role]);
      }
      add(other) {
        const m = new MaterialSide();
        for (const role of types.ROLES) m[role] = this[role] + other[role];
        return m;
      }
      nonEmpty() {
        return types.ROLES.some((role) => this[role] > 0);
      }
      isEmpty() {
        return !this.nonEmpty();
      }
      hasPawns() {
        return this.pawn > 0;
      }
      hasNonPawns() {
        return (
          this.knight > 0 ||
          this.bishop > 0 ||
          this.rook > 0 ||
          this.queen > 0 ||
          this.king > 0
        );
      }
      count() {
        return (
          this.pawn +
          this.knight +
          this.bishop +
          this.rook +
          this.queen +
          this.king
        );
      }
    }
    exports.MaterialSide = MaterialSide;
    class Material {
      constructor(white, black) {
        this.white = white;
        this.black = black;
      }
      static empty() {
        return new Material(MaterialSide.empty(), MaterialSide.empty());
      }
      static fromBoard(board) {
        return new Material(
          MaterialSide.fromBoard(board, "white"),
          MaterialSide.fromBoard(board, "black")
        );
      }
      clone() {
        return new Material(this.white.clone(), this.black.clone());
      }
      equals(other) {
        return this.white.equals(other.white) && this.black.equals(other.black);
      }
      add(other) {
        return new Material(
          this.white.add(other.white),
          this.black.add(other.black)
        );
      }
      count() {
        return this.white.count() + this.black.count();
      }
      isEmpty() {
        return this.white.isEmpty() && this.black.isEmpty();
      }
      nonEmpty() {
        return !this.isEmpty();
      }
      hasPawns() {
        return this.white.hasPawns() || this.black.hasPawns();
      }
      hasNonPawns() {
        return this.white.hasNonPawns() || this.black.hasNonPawns();
      }
    }
    exports.Material = Material;
    class RemainingChecks {
      constructor(white, black) {
        this.white = white;
        this.black = black;
      }
      static default() {
        return new RemainingChecks(3, 3);
      }
      clone() {
        return new RemainingChecks(this.white, this.black);
      }
      equals(other) {
        return this.white === other.white && this.black === other.black;
      }
    }
    exports.RemainingChecks = RemainingChecks;
    function defaultSetup() {
      return {
        board: board.Board.default(),
        pockets: undefined,
        turn: "white",
        unmovedRooks: squareSet.SquareSet.corners(),
        epSquare: undefined,
        remainingChecks: undefined,
        halfmoves: 0,
        fullmoves: 1,
      };
    }
    exports.defaultSetup = defaultSetup;
  });

  var chess = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chess = exports.Position = exports.Castles = exports.PositionError = exports.IllegalSetup = void 0;

    var IllegalSetup;
    (function (IllegalSetup) {
      IllegalSetup["Empty"] = "ERR_EMPTY";
      IllegalSetup["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
      IllegalSetup["ImpossibleCheck"] = "ERR_IMPOSSIBLE_CHECK";
      IllegalSetup["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
      IllegalSetup["Kings"] = "ERR_KINGS";
      IllegalSetup["Variant"] = "ERR_VARIANT";
    })((IllegalSetup = exports.IllegalSetup || (exports.IllegalSetup = {})));
    class PositionError extends Error {}
    exports.PositionError = PositionError;
    function attacksTo(square, attacker, board, occupied) {
      return board[attacker].intersect(
        attacks_1
          .rookAttacks(square, occupied)
          .intersect(board.rooksAndQueens())
          .union(
            attacks_1
              .bishopAttacks(square, occupied)
              .intersect(board.bishopsAndQueens())
          )
          .union(attacks_1.knightAttacks(square).intersect(board.knight))
          .union(attacks_1.kingAttacks(square).intersect(board.king))
          .union(
            attacks_1
              .pawnAttacks(util.opposite(attacker), square)
              .intersect(board.pawn)
          )
      );
    }
    function kingCastlesTo(color, side) {
      return color === "white"
        ? side === "a"
          ? 2
          : 6
        : side === "a"
        ? 58
        : 62;
    }
    function rookCastlesTo(color, side) {
      return color === "white"
        ? side === "a"
          ? 3
          : 5
        : side === "a"
        ? 59
        : 61;
    }
    class Castles {
      constructor() {}
      static default() {
        const castles = new Castles();
        castles.unmovedRooks = squareSet.SquareSet.corners();
        castles.rook = {
          white: { a: 0, h: 7 },
          black: { a: 56, h: 63 },
        };
        castles.path = {
          white: {
            a: new squareSet.SquareSet(0xe, 0),
            h: new squareSet.SquareSet(0x60, 0),
          },
          black: {
            a: new squareSet.SquareSet(0, 0x0e000000),
            h: new squareSet.SquareSet(0, 0x60000000),
          },
        };
        return castles;
      }
      static empty() {
        const castles = new Castles();
        castles.unmovedRooks = squareSet.SquareSet.empty();
        castles.rook = {
          white: { a: undefined, h: undefined },
          black: { a: undefined, h: undefined },
        };
        castles.path = {
          white: {
            a: squareSet.SquareSet.empty(),
            h: squareSet.SquareSet.empty(),
          },
          black: {
            a: squareSet.SquareSet.empty(),
            h: squareSet.SquareSet.empty(),
          },
        };
        return castles;
      }
      clone() {
        const castles = new Castles();
        castles.unmovedRooks = this.unmovedRooks;
        castles.rook = {
          white: { a: this.rook.white.a, h: this.rook.white.h },
          black: { a: this.rook.black.a, h: this.rook.black.h },
        };
        castles.path = {
          white: { a: this.path.white.a, h: this.path.white.h },
          black: { a: this.path.black.a, h: this.path.black.h },
        };
        return castles;
      }
      add(color, side, king, rook) {
        const kingTo = kingCastlesTo(color, side);
        const rookTo = rookCastlesTo(color, side);
        this.unmovedRooks = this.unmovedRooks.with(rook);
        this.rook[color][side] = rook;
        this.path[color][side] = attacks_1
          .between(rook, rookTo)
          .with(rookTo)
          .union(attacks_1.between(king, kingTo).with(kingTo))
          .without(king)
          .without(rook);
      }
      static fromSetup(setup) {
        const castles = Castles.empty();
        const rooks = setup.unmovedRooks.intersect(setup.board.rook);
        for (const color of types.COLORS) {
          const backrank = squareSet.SquareSet.backrank(color);
          const king = setup.board.kingOf(color);
          if (!util.defined(king) || !backrank.has(king)) continue;
          const side = rooks.intersect(setup.board[color]).intersect(backrank);
          const aSide = side.first();
          if (util.defined(aSide) && aSide < king)
            castles.add(color, "a", king, aSide);
          const hSide = side.last();
          if (util.defined(hSide) && king < hSide)
            castles.add(color, "h", king, hSide);
        }
        return castles;
      }
      discardRook(square) {
        if (this.unmovedRooks.has(square)) {
          this.unmovedRooks = this.unmovedRooks.without(square);
          for (const color of types.COLORS) {
            for (const side of types.CASTLING_SIDES) {
              if (this.rook[color][side] === square)
                this.rook[color][side] = undefined;
            }
          }
        }
      }
      discardSide(color) {
        this.unmovedRooks = this.unmovedRooks.diff(
          squareSet.SquareSet.backrank(color)
        );
        this.rook[color].a = undefined;
        this.rook[color].h = undefined;
      }
    }
    exports.Castles = Castles;
    class Position {
      constructor(rules) {
        this.rules = rules;
      }
      kingAttackers(square, attacker, occupied) {
        return attacksTo(square, attacker, this.board, occupied);
      }
      dropDests(_ctx) {
        return squareSet.SquareSet.empty();
      }
      playCaptureAt(square, captured) {
        this.halfmoves = 0;
        if (captured.role === "rook") this.castles.discardRook(square);
        if (this.pockets)
          this.pockets[util.opposite(captured.color)][captured.role]++;
      }
      ctx() {
        const variantEnd = this.isVariantEnd();
        const king = this.board.kingOf(this.turn);
        if (!util.defined(king))
          return {
            king,
            blockers: squareSet.SquareSet.empty(),
            checkers: squareSet.SquareSet.empty(),
            variantEnd,
            mustCapture: false,
          };
        const snipers = attacks_1
          .rookAttacks(king, squareSet.SquareSet.empty())
          .intersect(this.board.rooksAndQueens())
          .union(
            attacks_1
              .bishopAttacks(king, squareSet.SquareSet.empty())
              .intersect(this.board.bishopsAndQueens())
          )
          .intersect(this.board[util.opposite(this.turn)]);
        let blockers = squareSet.SquareSet.empty();
        for (const sniper of snipers) {
          const b = attacks_1
            .between(king, sniper)
            .intersect(this.board.occupied);
          if (!b.moreThanOne()) blockers = blockers.union(b);
        }
        const checkers = this.kingAttackers(
          king,
          util.opposite(this.turn),
          this.board.occupied
        );
        return {
          king,
          blockers,
          checkers,
          variantEnd,
          mustCapture: false,
        };
      }
      // The following should be identical in all subclasses
      clone() {
        var _a, _b;
        const pos = new this.constructor();
        pos.board = this.board.clone();
        pos.pockets =
          (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
        pos.turn = this.turn;
        pos.castles = this.castles.clone();
        pos.epSquare = this.epSquare;
        pos.remainingChecks =
          (_b = this.remainingChecks) === null || _b === void 0
            ? void 0
            : _b.clone();
        pos.halfmoves = this.halfmoves;
        pos.fullmoves = this.fullmoves;
        return pos;
      }
      equalsIgnoreMoves(other) {
        var _a, _b;
        return (
          this.rules === other.rules &&
          (this.pockets
            ? this.board.equals(other.board)
            : this.board.equalsIgnorePromoted(other.board)) &&
          ((other.pockets &&
            ((_a = this.pockets) === null || _a === void 0
              ? void 0
              : _a.equals(other.pockets))) ||
            (!this.pockets && !other.pockets)) &&
          this.turn === other.turn &&
          this.castles.unmovedRooks.equals(other.castles.unmovedRooks) &&
          this.legalEpSquare() === other.legalEpSquare() &&
          ((other.remainingChecks &&
            ((_b = this.remainingChecks) === null || _b === void 0
              ? void 0
              : _b.equals(other.remainingChecks))) ||
            (!this.remainingChecks && !other.remainingChecks))
        );
      }
      toSetup() {
        var _a, _b;
        return {
          board: this.board.clone(),
          pockets:
            (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
          turn: this.turn,
          unmovedRooks: this.castles.unmovedRooks,
          epSquare: this.legalEpSquare(),
          remainingChecks:
            (_b = this.remainingChecks) === null || _b === void 0
              ? void 0
              : _b.clone(),
          halfmoves: Math.min(this.halfmoves, 150),
          fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
        };
      }
      isInsufficientMaterial() {
        return types.COLORS.every((color) =>
          this.hasInsufficientMaterial(color)
        );
      }
      hasDests(ctx) {
        ctx = ctx || this.ctx();
        for (const square of this.board[this.turn]) {
          if (this.dests(square, ctx).nonEmpty()) return true;
        }
        return this.dropDests(ctx).nonEmpty();
      }
      isLegal(move, ctx) {
        if (types.isDrop(move)) {
          if (!this.pockets || this.pockets[this.turn][move.role] <= 0)
            return false;
          if (
            move.role === "pawn" &&
            squareSet.SquareSet.backranks().has(move.to)
          )
            return false;
          return this.dropDests(ctx).has(move.to);
        } else {
          if (move.promotion === "pawn") return false;
          if (move.promotion === "king" && this.rules !== "antichess")
            return false;
          if (
            !!move.promotion !==
            (this.board.pawn.has(move.from) &&
              squareSet.SquareSet.backranks().has(move.to))
          )
            return false;
          const dests = this.dests(move.from, ctx);
          return dests.has(move.to) || dests.has(this.normalizeMove(move).to);
        }
      }
      isCheck() {
        const king = this.board.kingOf(this.turn);
        return (
          util.defined(king) &&
          this.kingAttackers(
            king,
            util.opposite(this.turn),
            this.board.occupied
          ).nonEmpty()
        );
      }
      isEnd(ctx) {
        if (ctx ? ctx.variantEnd : this.isVariantEnd()) return true;
        return this.isInsufficientMaterial() || !this.hasDests(ctx);
      }
      isCheckmate(ctx) {
        ctx = ctx || this.ctx();
        return (
          !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx)
        );
      }
      isStalemate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
      }
      outcome(ctx) {
        const variantOutcome = this.variantOutcome(ctx);
        if (variantOutcome) return variantOutcome;
        ctx = ctx || this.ctx();
        if (this.isCheckmate(ctx)) return { winner: util.opposite(this.turn) };
        else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
          return { winner: undefined };
        else return;
      }
      allDests(ctx) {
        ctx = ctx || this.ctx();
        const d = new Map();
        if (ctx.variantEnd) return d;
        for (const square of this.board[this.turn]) {
          d.set(square, this.dests(square, ctx));
        }
        return d;
      }
      castlingSide(move) {
        if (types.isDrop(move)) return;
        const delta = move.to - move.from;
        if (Math.abs(delta) !== 2 && !this.board[this.turn].has(move.to))
          return;
        if (!this.board.king.has(move.from)) return;
        return delta > 0 ? "h" : "a";
      }
      normalizeMove(move) {
        const castlingSide = this.castlingSide(move);
        if (!castlingSide) return move;
        const rookFrom = this.castles.rook[this.turn][castlingSide];
        return {
          from: move.from,
          to: util.defined(rookFrom) ? rookFrom : move.to,
        };
      }
      play(move) {
        const turn = this.turn;
        const epSquare = this.epSquare;
        const castlingSide = this.castlingSide(move);
        this.epSquare = undefined;
        this.halfmoves += 1;
        if (turn === "black") this.fullmoves += 1;
        this.turn = util.opposite(turn);
        if (types.isDrop(move)) {
          this.board.set(move.to, { role: move.role, color: turn });
          if (this.pockets) this.pockets[turn][move.role]--;
          if (move.role === "pawn") this.halfmoves = 0;
        } else {
          const piece = this.board.take(move.from);
          if (!piece) return;
          let epCapture;
          if (piece.role === "pawn") {
            this.halfmoves = 0;
            if (move.to === epSquare) {
              epCapture = this.board.take(
                move.to + (turn === "white" ? -8 : 8)
              );
            }
            const delta = move.from - move.to;
            if (Math.abs(delta) === 16 && 8 <= move.from && move.from <= 55) {
              this.epSquare = (move.from + move.to) >> 1;
            }
            if (move.promotion) {
              piece.role = move.promotion;
              piece.promoted = true;
            }
          } else if (piece.role === "rook") {
            this.castles.discardRook(move.from);
          } else if (piece.role === "king") {
            if (castlingSide) {
              const rookFrom = this.castles.rook[turn][castlingSide];
              if (util.defined(rookFrom)) {
                const rook = this.board.take(rookFrom);
                this.board.set(kingCastlesTo(turn, castlingSide), piece);
                if (rook)
                  this.board.set(rookCastlesTo(turn, castlingSide), rook);
              }
            }
            this.castles.discardSide(turn);
            if (castlingSide) return;
          }
          const capture = this.board.set(move.to, piece) || epCapture;
          if (capture) this.playCaptureAt(move.to, capture);
        }
      }
      legalEpSquare(ctx) {
        if (!util.defined(this.epSquare)) return;
        ctx = ctx || this.ctx();
        const ourPawns = this.board.pieces(this.turn, "pawn");
        const candidates = ourPawns.intersect(
          attacks_1.pawnAttacks(util.opposite(this.turn), this.epSquare)
        );
        for (const candidate of candidates) {
          if (this.dests(candidate, ctx).has(this.epSquare))
            return this.epSquare;
        }
        return;
      }
    }
    exports.Position = Position;
    class Chess extends Position {
      constructor(rules) {
        super(rules || "chess");
      }
      static default() {
        const pos = new this();
        pos.board = board.Board.default();
        pos.pockets = undefined;
        pos.turn = "white";
        pos.castles = Castles.default();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
      }
      static fromSetup(setup) {
        const pos = new this();
        pos.board = setup.board.clone();
        pos.pockets = undefined;
        pos.turn = setup.turn;
        pos.castles = Castles.fromSetup(setup);
        pos.epSquare = pos.validEpSquare(setup.epSquare);
        pos.remainingChecks = undefined;
        pos.halfmoves = setup.halfmoves;
        pos.fullmoves = setup.fullmoves;
        return pos.validate().map((_) => pos);
      }
      clone() {
        return super.clone();
      }
      validate() {
        if (this.board.occupied.isEmpty())
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.Empty)
          );
        if (this.board.king.size() !== 2)
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.Kings)
          );
        if (!util.defined(this.board.kingOf(this.turn)))
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.Kings)
          );
        const otherKing = this.board.kingOf(util.opposite(this.turn));
        if (!util.defined(otherKing))
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.Kings)
          );
        if (
          this.kingAttackers(
            otherKing,
            this.turn,
            this.board.occupied
          ).nonEmpty()
        )
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.OppositeCheck)
          );
        if (squareSet.SquareSet.backranks().intersects(this.board.pawn))
          return result_1__default["default"].Result.err(
            new PositionError(IllegalSetup.PawnsOnBackrank)
          );
        return this.validateCheckers();
      }
      validateCheckers() {
        const ourKing = this.board.kingOf(this.turn);
        if (util.defined(ourKing)) {
          // Multiple sliding checkers aligned with king.
          const checkers = this.kingAttackers(
            ourKing,
            util.opposite(this.turn),
            this.board.occupied
          );
          if (
            checkers.size() > 2 ||
            (checkers.size() === 2 &&
              attacks_1.ray(checkers.first(), checkers.last()).has(ourKing))
          )
            return result_1__default["default"].Result.err(
              new PositionError(IllegalSetup.ImpossibleCheck)
            );
          // En passant square aligned with checker and king.
          if (util.defined(this.epSquare)) {
            for (const checker of checkers) {
              if (attacks_1.ray(checker, this.epSquare).has(ourKing))
                return result_1__default["default"].Result.err(
                  new PositionError(IllegalSetup.ImpossibleCheck)
                );
            }
          }
        }
        return result_1__default["default"].Result.ok(undefined);
      }
      validEpSquare(square) {
        if (!util.defined(square)) return;
        const epRank = this.turn === "white" ? 5 : 2;
        const forward = this.turn === "white" ? 8 : -8;
        if (util.squareRank(square) !== epRank) return;
        if (this.board.occupied.has(square + forward)) return;
        const pawn = square - forward;
        if (
          !this.board.pawn.has(pawn) ||
          !this.board[util.opposite(this.turn)].has(pawn)
        )
          return;
        return square;
      }
      castlingDest(side, ctx) {
        if (!util.defined(ctx.king) || ctx.checkers.nonEmpty())
          return squareSet.SquareSet.empty();
        const rook = this.castles.rook[this.turn][side];
        if (!util.defined(rook)) return squareSet.SquareSet.empty();
        if (this.castles.path[this.turn][side].intersects(this.board.occupied))
          return squareSet.SquareSet.empty();
        const kingTo = kingCastlesTo(this.turn, side);
        const kingPath = attacks_1.between(ctx.king, kingTo);
        const occ = this.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
          if (this.kingAttackers(sq, util.opposite(this.turn), occ).nonEmpty())
            return squareSet.SquareSet.empty();
        }
        const rookTo = rookCastlesTo(this.turn, side);
        const after = this.board.occupied
          .toggle(ctx.king)
          .toggle(rook)
          .toggle(rookTo);
        if (
          this.kingAttackers(kingTo, util.opposite(this.turn), after).nonEmpty()
        )
          return squareSet.SquareSet.empty();
        return squareSet.SquareSet.fromSquare(rook);
      }
      canCaptureEp(pawn, ctx) {
        if (!util.defined(this.epSquare)) return false;
        if (!attacks_1.pawnAttacks(this.turn, pawn).has(this.epSquare))
          return false;
        if (!util.defined(ctx.king)) return true;
        const captured = this.epSquare + (this.turn === "white" ? -8 : 8);
        const occupied = this.board.occupied
          .toggle(pawn)
          .toggle(this.epSquare)
          .toggle(captured);
        return !this.kingAttackers(
          ctx.king,
          util.opposite(this.turn),
          occupied
        ).intersects(occupied);
      }
      pseudoDests(square, ctx) {
        if (ctx.variantEnd) return squareSet.SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
          return squareSet.SquareSet.empty();
        let pseudo = attacks_1.attacks(piece, square, this.board.occupied);
        if (piece.role === "pawn") {
          let captureTargets = this.board[util.opposite(this.turn)];
          if (util.defined(this.epSquare))
            captureTargets = captureTargets.with(this.epSquare);
          pseudo = pseudo.intersect(captureTargets);
          const delta = this.turn === "white" ? 8 : -8;
          const step = square + delta;
          if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
            pseudo = pseudo.with(step);
            const canDoubleStep =
              this.turn === "white" ? square < 16 : square >= 64 - 16;
            const doubleStep = step + delta;
            if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
              pseudo = pseudo.with(doubleStep);
            }
          }
          return pseudo;
        } else {
          pseudo = pseudo.diff(this.board[this.turn]);
        }
        if (square === ctx.king)
          return pseudo
            .union(this.castlingDest("a", ctx))
            .union(this.castlingDest("h", ctx));
        else return pseudo;
      }
      dests(square, ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd) return squareSet.SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
          return squareSet.SquareSet.empty();
        let pseudo, legal;
        if (piece.role === "pawn") {
          pseudo = attacks_1
            .pawnAttacks(this.turn, square)
            .intersect(this.board[util.opposite(this.turn)]);
          const delta = this.turn === "white" ? 8 : -8;
          const step = square + delta;
          if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
            pseudo = pseudo.with(step);
            const canDoubleStep =
              this.turn === "white" ? square < 16 : square >= 64 - 16;
            const doubleStep = step + delta;
            if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
              pseudo = pseudo.with(doubleStep);
            }
          }
          if (util.defined(this.epSquare) && this.canCaptureEp(square, ctx)) {
            const pawn = this.epSquare - delta;
            if (
              ctx.checkers.isEmpty() ||
              ctx.checkers.singleSquare() === pawn
            ) {
              legal = squareSet.SquareSet.fromSquare(this.epSquare);
            }
          }
        } else if (piece.role === "bishop")
          pseudo = attacks_1.bishopAttacks(square, this.board.occupied);
        else if (piece.role === "knight")
          pseudo = attacks_1.knightAttacks(square);
        else if (piece.role === "rook")
          pseudo = attacks_1.rookAttacks(square, this.board.occupied);
        else if (piece.role === "queen")
          pseudo = attacks_1.queenAttacks(square, this.board.occupied);
        else pseudo = attacks_1.kingAttacks(square);
        pseudo = pseudo.diff(this.board[this.turn]);
        if (util.defined(ctx.king)) {
          if (piece.role === "king") {
            const occ = this.board.occupied.without(square);
            for (const to of pseudo) {
              if (
                this.kingAttackers(to, util.opposite(this.turn), occ).nonEmpty()
              )
                pseudo = pseudo.without(to);
            }
            return pseudo
              .union(this.castlingDest("a", ctx))
              .union(this.castlingDest("h", ctx));
          }
          if (ctx.checkers.nonEmpty()) {
            const checker = ctx.checkers.singleSquare();
            if (!util.defined(checker)) return squareSet.SquareSet.empty();
            pseudo = pseudo.intersect(
              attacks_1.between(checker, ctx.king).with(checker)
            );
          }
          if (ctx.blockers.has(square))
            pseudo = pseudo.intersect(attacks_1.ray(square, ctx.king));
        }
        if (legal) pseudo = pseudo.union(legal);
        return pseudo;
      }
      isVariantEnd() {
        return false;
      }
      variantOutcome(_ctx) {
        return;
      }
      hasInsufficientMaterial(color) {
        if (
          this.board[color]
            .intersect(this.board.pawn.union(this.board.rooksAndQueens()))
            .nonEmpty()
        )
          return false;
        if (this.board[color].intersects(this.board.knight)) {
          return (
            this.board[color].size() <= 2 &&
            this.board[util.opposite(color)]
              .diff(this.board.king)
              .diff(this.board.queen)
              .isEmpty()
          );
        }
        if (this.board[color].intersects(this.board.bishop)) {
          const sameColor =
            !this.board.bishop.intersects(squareSet.SquareSet.darkSquares()) ||
            !this.board.bishop.intersects(squareSet.SquareSet.lightSquares());
          return (
            sameColor &&
            this.board.pawn.isEmpty() &&
            this.board.knight.isEmpty()
          );
        }
        return true;
      }
    }
    exports.Chess = Chess;
  });

  var compat = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lichessVariantRules = exports.scalachessCharPair = exports.chessgroundMove = exports.chessgroundDests = void 0;

    function chessgroundDests(pos, opts) {
      const result = new Map();
      const ctx = pos.ctx();
      for (const [from, squares] of pos.allDests(ctx)) {
        if (squares.nonEmpty()) {
          const d = Array.from(squares, util.makeSquare);
          if (
            !(opts === null || opts === void 0 ? void 0 : opts.chess960) &&
            from === ctx.king &&
            util.squareFile(from) === 4
          ) {
            // Chessground needs both types of castling dests and filters based on
            // a rookCastles setting.
            if (squares.has(0)) d.push("c1");
            else if (squares.has(56)) d.push("c8");
            if (squares.has(7)) d.push("g1");
            else if (squares.has(63)) d.push("g8");
          }
          result.set(util.makeSquare(from), d);
        }
      }
      return result;
    }
    exports.chessgroundDests = chessgroundDests;
    function chessgroundMove(move) {
      return types.isDrop(move)
        ? [util.makeSquare(move.to)]
        : [util.makeSquare(move.from), util.makeSquare(move.to)];
    }
    exports.chessgroundMove = chessgroundMove;
    function scalachessCharPair(move) {
      if (types.isDrop(move))
        return String.fromCharCode(
          35 + move.to,
          35 +
            64 +
            8 * 5 +
            ["queen", "rook", "bishop", "knight", "pawn"].indexOf(move.role)
        );
      else
        return String.fromCharCode(
          35 + move.from,
          move.promotion
            ? 35 +
                64 +
                8 *
                  ["queen", "rook", "bishop", "knight", "king"].indexOf(
                    move.promotion
                  ) +
                util.squareFile(move.to)
            : 35 + move.to
        );
    }
    exports.scalachessCharPair = scalachessCharPair;
    function lichessVariantRules(variant) {
      switch (variant) {
        case "standard":
        case "chess960":
        case "fromPosition":
          return "chess";
        case "threeCheck":
          return "3check";
        case "kingOfTheHill":
          return "kingofthehill";
        case "racingKings":
          return "racingkings";
        default:
          return variant;
      }
    }
    exports.lichessVariantRules = lichessVariantRules;
  });

  var fen = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeFen = exports.makeRemainingChecks = exports.makeCastlingFen = exports.makePockets = exports.makePocket = exports.makeBoardFen = exports.makePiece = exports.parsePiece = exports.parseFen = exports.parseRemainingChecks = exports.parseCastlingFen = exports.parsePockets = exports.parseBoardFen = exports.FenError = exports.InvalidFen = exports.EMPTY_FEN = exports.EMPTY_EPD = exports.EMPTY_BOARD_FEN = exports.INITIAL_FEN = exports.INITIAL_EPD = exports.INITIAL_BOARD_FEN = void 0;

    exports.INITIAL_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    exports.INITIAL_EPD = exports.INITIAL_BOARD_FEN + " w KQkq -";
    exports.INITIAL_FEN = exports.INITIAL_EPD + " 0 1";
    exports.EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8";
    exports.EMPTY_EPD = exports.EMPTY_BOARD_FEN + " w - -";
    exports.EMPTY_FEN = exports.EMPTY_EPD + " 0 1";
    var InvalidFen;
    (function (InvalidFen) {
      InvalidFen["Fen"] = "ERR_FEN";
      InvalidFen["Board"] = "ERR_BOARD";
      InvalidFen["Pockets"] = "ERR_POCKETS";
      InvalidFen["Turn"] = "ERR_TURN";
      InvalidFen["Castling"] = "ERR_CASTLING";
      InvalidFen["EpSquare"] = "ERR_EP_SQUARE";
      InvalidFen["RemainingChecks"] = "ERR_REMAINING_CHECKS";
      InvalidFen["Halfmoves"] = "ERR_HALFMOVES";
      InvalidFen["Fullmoves"] = "ERR_FULLMOVES";
    })((InvalidFen = exports.InvalidFen || (exports.InvalidFen = {})));
    class FenError extends Error {}
    exports.FenError = FenError;
    function nthIndexOf(haystack, needle, n) {
      let index = haystack.indexOf(needle);
      while (n-- > 0) {
        if (index === -1) break;
        index = haystack.indexOf(needle, index + needle.length);
      }
      return index;
    }
    function parseSmallUint(str) {
      return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
    }
    function charToPiece(ch) {
      const role = util.charToRole(ch);
      return (
        role && { role, color: ch.toLowerCase() === ch ? "black" : "white" }
      );
    }
    function parseBoardFen(boardPart) {
      const board$1 = board.Board.empty();
      let rank = 7;
      let file = 0;
      for (let i = 0; i < boardPart.length; i++) {
        const c = boardPart[i];
        if (c === "/" && file === 8) {
          file = 0;
          rank--;
        } else {
          const step = parseInt(c, 10);
          if (step > 0) file += step;
          else {
            if (file >= 8 || rank < 0)
              return result_1__default["default"].Result.err(
                new FenError(InvalidFen.Board)
              );
            const square = file + rank * 8;
            const piece = charToPiece(c);
            if (!piece)
              return result_1__default["default"].Result.err(
                new FenError(InvalidFen.Board)
              );
            if (boardPart[i + 1] === "~") {
              piece.promoted = true;
              i++;
            }
            board$1.set(square, piece);
            file++;
          }
        }
      }
      if (rank !== 0 || file !== 8)
        return result_1__default["default"].Result.err(
          new FenError(InvalidFen.Board)
        );
      return result_1__default["default"].Result.ok(board$1);
    }
    exports.parseBoardFen = parseBoardFen;
    function parsePockets(pocketPart) {
      if (pocketPart.length > 64)
        return result_1__default["default"].Result.err(
          new FenError(InvalidFen.Pockets)
        );
      const pockets = setup.Material.empty();
      for (const c of pocketPart) {
        const piece = charToPiece(c);
        if (!piece)
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.Pockets)
          );
        pockets[piece.color][piece.role]++;
      }
      return result_1__default["default"].Result.ok(pockets);
    }
    exports.parsePockets = parsePockets;
    function parseCastlingFen(board, castlingPart) {
      let unmovedRooks = squareSet.SquareSet.empty();
      if (castlingPart === "-")
        return result_1__default["default"].Result.ok(unmovedRooks);
      if (!/^[KQABCDEFGH]{0,2}[kqabcdefgh]{0,2}$/.test(castlingPart)) {
        return result_1__default["default"].Result.err(
          new FenError(InvalidFen.Castling)
        );
      }
      for (const c of castlingPart) {
        const lower = c.toLowerCase();
        const color = c === lower ? "black" : "white";
        const backrank = squareSet.SquareSet.backrank(color).intersect(
          board[color]
        );
        let candidates;
        if (lower === "q") candidates = backrank;
        else if (lower === "k") candidates = backrank.reversed();
        else
          candidates = squareSet.SquareSet.fromSquare(
            lower.charCodeAt(0) - "a".charCodeAt(0)
          ).intersect(backrank);
        for (const square of candidates) {
          if (board.king.has(square) && !board.promoted.has(square)) break;
          if (board.rook.has(square)) {
            unmovedRooks = unmovedRooks.with(square);
            break;
          }
        }
      }
      return result_1__default["default"].Result.ok(unmovedRooks);
    }
    exports.parseCastlingFen = parseCastlingFen;
    function parseRemainingChecks(part) {
      const parts = part.split("+");
      if (parts.length === 3 && parts[0] === "") {
        const white = parseSmallUint(parts[1]);
        const black = parseSmallUint(parts[2]);
        if (
          !util.defined(white) ||
          white > 3 ||
          !util.defined(black) ||
          black > 3
        )
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.RemainingChecks)
          );
        return result_1__default["default"].Result.ok(
          new setup.RemainingChecks(3 - white, 3 - black)
        );
      } else if (parts.length === 2) {
        const white = parseSmallUint(parts[0]);
        const black = parseSmallUint(parts[1]);
        if (
          !util.defined(white) ||
          white > 3 ||
          !util.defined(black) ||
          black > 3
        )
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.RemainingChecks)
          );
        return result_1__default["default"].Result.ok(
          new setup.RemainingChecks(white, black)
        );
      } else
        return result_1__default["default"].Result.err(
          new FenError(InvalidFen.RemainingChecks)
        );
    }
    exports.parseRemainingChecks = parseRemainingChecks;
    function parseFen(fen) {
      const parts = fen.split(" ");
      const boardPart = parts.shift();
      // Board and pockets
      let board,
        pockets = result_1__default["default"].Result.ok(undefined);
      if (boardPart.endsWith("]")) {
        const pocketStart = boardPart.indexOf("[");
        if (pocketStart === -1)
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.Fen)
          );
        board = parseBoardFen(boardPart.substr(0, pocketStart));
        pockets = parsePockets(
          boardPart.substr(
            pocketStart + 1,
            boardPart.length - 1 - pocketStart - 1
          )
        );
      } else {
        const pocketStart = nthIndexOf(boardPart, "/", 7);
        if (pocketStart === -1) board = parseBoardFen(boardPart);
        else {
          board = parseBoardFen(boardPart.substr(0, pocketStart));
          pockets = parsePockets(boardPart.substr(pocketStart + 1));
        }
      }
      // Turn
      let turn;
      const turnPart = parts.shift();
      if (!util.defined(turnPart) || turnPart === "w") turn = "white";
      else if (turnPart === "b") turn = "black";
      else
        return result_1__default["default"].Result.err(
          new FenError(InvalidFen.Turn)
        );
      return board.chain((board) => {
        // Castling
        const castlingPart = parts.shift();
        const unmovedRooks = util.defined(castlingPart)
          ? parseCastlingFen(board, castlingPart)
          : result_1__default["default"].Result.ok(squareSet.SquareSet.empty());
        // En passant square
        const epPart = parts.shift();
        let epSquare;
        if (util.defined(epPart) && epPart !== "-") {
          epSquare = util.parseSquare(epPart);
          if (!util.defined(epSquare))
            return result_1__default["default"].Result.err(
              new FenError(InvalidFen.EpSquare)
            );
        }
        // Halfmoves or remaining checks
        let halfmovePart = parts.shift();
        let earlyRemainingChecks;
        if (util.defined(halfmovePart) && halfmovePart.includes("+")) {
          earlyRemainingChecks = parseRemainingChecks(halfmovePart);
          halfmovePart = parts.shift();
        }
        const halfmoves = util.defined(halfmovePart)
          ? parseSmallUint(halfmovePart)
          : 0;
        if (!util.defined(halfmoves))
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.Halfmoves)
          );
        const fullmovesPart = parts.shift();
        const fullmoves = util.defined(fullmovesPart)
          ? parseSmallUint(fullmovesPart)
          : 1;
        if (!util.defined(fullmoves))
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.Fullmoves)
          );
        const remainingChecksPart = parts.shift();
        let remainingChecks = result_1__default["default"].Result.ok(undefined);
        if (util.defined(remainingChecksPart)) {
          if (util.defined(earlyRemainingChecks))
            return result_1__default["default"].Result.err(
              new FenError(InvalidFen.RemainingChecks)
            );
          remainingChecks = parseRemainingChecks(remainingChecksPart);
        } else if (util.defined(earlyRemainingChecks)) {
          remainingChecks = earlyRemainingChecks;
        }
        if (parts.length > 0)
          return result_1__default["default"].Result.err(
            new FenError(InvalidFen.Fen)
          );
        return pockets.chain((pockets) =>
          unmovedRooks.chain((unmovedRooks) =>
            remainingChecks.map((remainingChecks) => {
              return {
                board,
                pockets,
                turn,
                unmovedRooks,
                remainingChecks,
                epSquare,
                halfmoves,
                fullmoves: Math.max(1, fullmoves),
              };
            })
          )
        );
      });
    }
    exports.parseFen = parseFen;
    function parsePiece(str) {
      if (!str) return;
      const piece = charToPiece(str[0]);
      if (!piece) return;
      if (str.length === 2 && str[1] === "~") piece.promoted = true;
      else if (str.length > 1) return;
      return piece;
    }
    exports.parsePiece = parsePiece;
    function makePiece(piece, opts) {
      let r = util.roleToChar(piece.role);
      if (piece.color === "white") r = r.toUpperCase();
      if (
        (opts === null || opts === void 0 ? void 0 : opts.promoted) &&
        piece.promoted
      )
        r += "~";
      return r;
    }
    exports.makePiece = makePiece;
    function makeBoardFen(board, opts) {
      let fen = "";
      let empty = 0;
      for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
          const square = file + rank * 8;
          const piece = board.get(square);
          if (!piece) empty++;
          else {
            if (empty > 0) {
              fen += empty;
              empty = 0;
            }
            fen += makePiece(piece, opts);
          }
          if (file === 7) {
            if (empty > 0) {
              fen += empty;
              empty = 0;
            }
            if (rank !== 0) fen += "/";
          }
        }
      }
      return fen;
    }
    exports.makeBoardFen = makeBoardFen;
    function makePocket(material) {
      return types.ROLES.map((role) =>
        util.roleToChar(role).repeat(material[role])
      ).join("");
    }
    exports.makePocket = makePocket;
    function makePockets(pocket) {
      return makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
    }
    exports.makePockets = makePockets;
    function makeCastlingFen(board, unmovedRooks, opts) {
      const shredder =
        opts === null || opts === void 0 ? void 0 : opts.shredder;
      let fen = "";
      for (const color of types.COLORS) {
        const backrank = squareSet.SquareSet.backrank(color);
        const king = board.kingOf(color);
        if (!util.defined(king) || !backrank.has(king)) continue;
        const candidates = board.pieces(color, "rook").intersect(backrank);
        for (const rook of unmovedRooks.intersect(candidates).reversed()) {
          if (!shredder && rook === candidates.first() && rook < king) {
            fen += color === "white" ? "Q" : "q";
          } else if (!shredder && rook === candidates.last() && king < rook) {
            fen += color === "white" ? "K" : "k";
          } else {
            const file = types.FILE_NAMES[util.squareFile(rook)];
            fen += color === "white" ? file.toUpperCase() : file;
          }
        }
      }
      return fen || "-";
    }
    exports.makeCastlingFen = makeCastlingFen;
    function makeRemainingChecks(checks) {
      return `${checks.white}+${checks.black}`;
    }
    exports.makeRemainingChecks = makeRemainingChecks;
    function makeFen(setup, opts) {
      return [
        makeBoardFen(setup.board, opts) +
          (setup.pockets ? `[${makePockets(setup.pockets)}]` : ""),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.unmovedRooks, opts),
        util.defined(setup.epSquare) ? util.makeSquare(setup.epSquare) : "-",
        ...(setup.remainingChecks
          ? [makeRemainingChecks(setup.remainingChecks)]
          : []),
        ...((opts === null || opts === void 0 ? void 0 : opts.epd)
          ? []
          : [
              Math.max(0, Math.min(setup.halfmoves, 9999)),
              Math.max(1, Math.min(setup.fullmoves, 9999)),
            ]),
      ].join(" ");
    }
    exports.makeFen = makeFen;
  });

  var debug = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perft = exports.dests = exports.square = exports.board = exports.piece = exports.squareSet = void 0;

    function squareSet$1(squares) {
      const r = [];
      for (let y = 7; y >= 0; y--) {
        for (let x = 0; x < 8; x++) {
          const square = x + y * 8;
          r.push(squares.has(square) ? "1" : ".");
          r.push(x < 7 ? " " : "\n");
        }
      }
      return r.join("");
    }
    exports.squareSet = squareSet$1;
    function piece(piece) {
      return fen.makePiece(piece);
    }
    exports.piece = piece;
    function board(board) {
      const r = [];
      for (let y = 7; y >= 0; y--) {
        for (let x = 0; x < 8; x++) {
          const square = x + y * 8;
          const p = board.get(square);
          const col = p ? piece(p) : ".";
          r.push(col);
          r.push(x < 7 ? (col.length < 2 ? " " : "") : "\n");
        }
      }
      return r.join("");
    }
    exports.board = board;
    function square(sq) {
      return util.makeSquare(sq);
    }
    exports.square = square;
    function dests(dests) {
      const lines = [];
      for (const [from, to] of dests) {
        lines.push(
          `${util.makeSquare(from)}: ${Array.from(to, square).join(" ")}`
        );
      }
      return lines.join("\n");
    }
    exports.dests = dests;
    function perft(pos, depth, log = false) {
      if (depth < 1) return 1;
      const promotionRoles = ["queen", "knight", "rook", "bishop"];
      if (pos.rules === "antichess") promotionRoles.push("king");
      const ctx = pos.ctx();
      const dropDests = pos.dropDests(ctx);
      if (!log && depth === 1 && dropDests.isEmpty()) {
        // Optimization for leaf nodes.
        let nodes = 0;
        for (const [from, to] of pos.allDests(ctx)) {
          nodes += to.size();
          if (pos.board.pawn.has(from)) {
            const backrank = squareSet.SquareSet.backrank(
              util.opposite(pos.turn)
            );
            nodes +=
              to.intersect(backrank).size() * (promotionRoles.length - 1);
          }
        }
        return nodes;
      } else {
        let nodes = 0;
        for (const [from, dests] of pos.allDests(ctx)) {
          const promotions =
            util.squareRank(from) === (pos.turn === "white" ? 6 : 1) &&
            pos.board.pawn.has(from)
              ? promotionRoles
              : [undefined];
          for (const to of dests) {
            for (const promotion of promotions) {
              const child = pos.clone();
              const move = { from, to, promotion };
              child.play(move);
              const children = perft(child, depth - 1, false);
              if (log) console.log(util.makeUci(move), children);
              nodes += children;
            }
          }
        }
        if (pos.pockets) {
          for (const role of types.ROLES) {
            if (pos.pockets[pos.turn][role] > 0) {
              for (const to of role === "pawn"
                ? dropDests.diff(squareSet.SquareSet.backranks())
                : dropDests) {
                const child = pos.clone();
                const move = { role, to };
                child.play(move);
                const children = perft(child, depth - 1, false);
                if (log) console.log(util.makeUci(move), children);
                nodes += children;
              }
            }
          }
        }
        return nodes;
      }
    }
    exports.perft = perft;
  });

  var hash = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hashSetup = exports.hashRemainingChecks = exports.hashMaterial = exports.hashMaterialSide = exports.hashBoard = exports.fxhash32 = void 0;

    function rol32(n, left) {
      return (n << left) | (n >>> (32 - left));
    }
    function fxhash32(word, state = 0) {
      return Math.imul(rol32(state, 5) ^ word, 0x9e3779b9);
    }
    exports.fxhash32 = fxhash32;
    function hashBoard(board, state = 0) {
      state = fxhash32(board.white.lo, fxhash32(board.white.hi, state));
      for (const role of types.ROLES)
        state = fxhash32(board[role].lo, fxhash32(board[role].hi, state));
      return state;
    }
    exports.hashBoard = hashBoard;
    function hashMaterialSide(side, state = 0) {
      for (const role of types.ROLES) state = fxhash32(side[role], state);
      return state;
    }
    exports.hashMaterialSide = hashMaterialSide;
    function hashMaterial(material, state = 0) {
      for (const color of types.COLORS)
        state = hashMaterialSide(material[color], state);
      return state;
    }
    exports.hashMaterial = hashMaterial;
    function hashRemainingChecks(checks, state = 0) {
      return fxhash32(checks.white, fxhash32(checks.black, state));
    }
    exports.hashRemainingChecks = hashRemainingChecks;
    function hashSetup(setup, state = 0) {
      state = hashBoard(setup.board, state);
      if (setup.pockets) state = hashMaterial(setup.pockets, state);
      if (setup.turn === "white") state = fxhash32(1, state);
      state = fxhash32(
        setup.unmovedRooks.lo,
        fxhash32(setup.unmovedRooks.hi, state)
      );
      if (util.defined(setup.epSquare)) state = fxhash32(setup.epSquare, state);
      if (setup.remainingChecks)
        state = hashRemainingChecks(setup.remainingChecks, state);
      return state;
    }
    exports.hashSetup = hashSetup;
  });

  var san = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseSan = exports.makeSan = exports.makeSanVariation = exports.makeSanAndPlay = void 0;

    function makeSanWithoutSuffix(pos, move) {
      let san = "";
      if (types.isDrop(move)) {
        if (move.role !== "pawn")
          san = util.roleToChar(move.role).toUpperCase();
        san += "@" + util.makeSquare(move.to);
      } else {
        const role = pos.board.getRole(move.from);
        if (!role) return "--";
        if (
          role === "king" &&
          (pos.board[pos.turn].has(move.to) ||
            Math.abs(move.to - move.from) === 2)
        ) {
          san = move.to > move.from ? "O-O" : "O-O-O";
        } else {
          const capture =
            pos.board.occupied.has(move.to) ||
            (role === "pawn" &&
              util.squareFile(move.from) !== util.squareFile(move.to));
          if (role !== "pawn") {
            san = util.roleToChar(role).toUpperCase();
            // Disambiguation
            let others;
            if (role === "king")
              others = attacks_1.kingAttacks(move.to).intersect(pos.board.king);
            else if (role === "queen")
              others = attacks_1
                .queenAttacks(move.to, pos.board.occupied)
                .intersect(pos.board.queen);
            else if (role === "rook")
              others = attacks_1
                .rookAttacks(move.to, pos.board.occupied)
                .intersect(pos.board.rook);
            else if (role === "bishop")
              others = attacks_1
                .bishopAttacks(move.to, pos.board.occupied)
                .intersect(pos.board.bishop);
            else
              others = attacks_1
                .knightAttacks(move.to)
                .intersect(pos.board.knight);
            others = others.intersect(pos.board[pos.turn]).without(move.from);
            if (others.nonEmpty()) {
              const ctx = pos.ctx();
              for (const from of others) {
                if (!pos.dests(from, ctx).has(move.to))
                  others = others.without(from);
              }
              if (others.nonEmpty()) {
                let row = false;
                let column = others.intersects(
                  squareSet.SquareSet.fromRank(util.squareRank(move.from))
                );
                if (
                  others.intersects(
                    squareSet.SquareSet.fromFile(util.squareFile(move.from))
                  )
                )
                  row = true;
                else column = true;
                if (column) san += types.FILE_NAMES[util.squareFile(move.from)];
                if (row) san += types.RANK_NAMES[util.squareRank(move.from)];
              }
            }
          } else if (capture)
            san = types.FILE_NAMES[util.squareFile(move.from)];
          if (capture) san += "x";
          san += util.makeSquare(move.to);
          if (move.promotion)
            san += "=" + util.roleToChar(move.promotion).toUpperCase();
        }
      }
      return san;
    }
    function makeSanAndPlay(pos, move) {
      var _a;
      const san = makeSanWithoutSuffix(pos, move);
      pos.play(move);
      if ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner)
        return san + "#";
      if (pos.isCheck()) return san + "+";
      return san;
    }
    exports.makeSanAndPlay = makeSanAndPlay;
    function makeSanVariation(pos, variation) {
      var _a;
      pos = pos.clone();
      const line = [];
      for (let i = 0; i < variation.length; i++) {
        if (i !== 0) line.push(" ");
        if (pos.turn === "white") line.push(pos.fullmoves, ". ");
        else if (i === 0) line.push(pos.fullmoves, "... ");
        const san = makeSanWithoutSuffix(pos, variation[i]);
        pos.play(variation[i]);
        line.push(san);
        if (san === "--") return line.join("");
        if (
          i === variation.length - 1 &&
          ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner)
        )
          line.push("#");
        else if (pos.isCheck()) line.push("+");
      }
      return line.join("");
    }
    exports.makeSanVariation = makeSanVariation;
    function makeSan(pos, move) {
      return makeSanAndPlay(pos.clone(), move);
    }
    exports.makeSan = makeSan;
    function parseSan(pos, san) {
      const ctx = pos.ctx();
      // Castling
      let castlingSide;
      if (san === "O-O" || san === "O-O+" || san === "O-O#") castlingSide = "h";
      else if (san === "O-O-O" || san === "O-O-O+" || san === "O-O-O#")
        castlingSide = "a";
      if (castlingSide) {
        const rook = pos.castles.rook[pos.turn][castlingSide];
        if (
          !util.defined(ctx.king) ||
          !util.defined(rook) ||
          !pos.dests(ctx.king, ctx).has(rook)
        )
          return;
        return {
          from: ctx.king,
          to: rook,
        };
      }
      // Normal move
      const match = san.match(
        /^([NBRQK])?([a-h])?([1-8])?[\-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[\+#]?$/
      );
      if (!match) {
        // Drop
        const match = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[\+#]?$/);
        if (!match) return;
        const move = {
          role: util.charToRole(match[1]) || "pawn",
          to: util.parseSquare(match[2]),
        };
        return pos.isLegal(move, ctx) ? move : undefined;
      }
      const role = util.charToRole(match[1]) || "pawn";
      const to = util.parseSquare(match[4]);
      const promotion = util.charToRole(match[5]);
      if (
        !!promotion !==
        (role === "pawn" && squareSet.SquareSet.backranks().has(to))
      )
        return;
      if (promotion === "king" && pos.rules !== "antichess") return;
      let candidates = pos.board.pieces(pos.turn, role);
      if (match[2])
        candidates = candidates.intersect(
          squareSet.SquareSet.fromFile(
            match[2].charCodeAt(0) - "a".charCodeAt(0)
          )
        );
      if (match[3])
        candidates = candidates.intersect(
          squareSet.SquareSet.fromRank(
            match[3].charCodeAt(0) - "1".charCodeAt(0)
          )
        );
      // Optimization: Reduce set of candidates
      const pawnAdvance =
        role === "pawn"
          ? squareSet.SquareSet.fromFile(util.squareFile(to))
          : squareSet.SquareSet.empty();
      candidates = candidates.intersect(
        pawnAdvance.union(
          attacks_1.attacks(
            { color: util.opposite(pos.turn), role },
            to,
            pos.board.occupied
          )
        )
      );
      // Check uniqueness and legality
      let from;
      for (const candidate of candidates) {
        if (pos.dests(candidate, ctx).has(to)) {
          if (util.defined(from)) return; // Ambiguous
          from = candidate;
        }
      }
      if (!util.defined(from)) return; // Illegal
      return {
        from,
        to,
        promotion,
      };
    }
    exports.parseSan = parseSan;
  });

  var transform = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformSetup = exports.transformBoard = exports.rotate180 = exports.flipDiagonal = exports.flipHorizontal = exports.flipVertical = void 0;

    function flipVertical(s) {
      return s.bswap64();
    }
    exports.flipVertical = flipVertical;
    function flipHorizontal(s) {
      const k1 = new squareSet.SquareSet(0x55555555, 0x55555555);
      const k2 = new squareSet.SquareSet(0x33333333, 0x33333333);
      const k4 = new squareSet.SquareSet(0x0f0f0f0f, 0x0f0f0f0f);
      s = s.shr64(1).intersect(k1).union(s.intersect(k1).shl64(1));
      s = s.shr64(2).intersect(k2).union(s.intersect(k2).shl64(2));
      s = s.shr64(4).intersect(k4).union(s.intersect(k4).shl64(4));
      return s;
    }
    exports.flipHorizontal = flipHorizontal;
    function flipDiagonal(s) {
      let t = s
        .xor(s.shl64(28))
        .intersect(new squareSet.SquareSet(0, 0x0f0f0f0f));
      s = s.xor(t.xor(t.shr64(28)));
      t = s
        .xor(s.shl64(14))
        .intersect(new squareSet.SquareSet(0x33330000, 0x33330000));
      s = s.xor(t.xor(t.shr64(14)));
      t = s
        .xor(s.shl64(7))
        .intersect(new squareSet.SquareSet(0x55005500, 0x55005500));
      s = s.xor(t.xor(t.shr64(7)));
      return s;
    }
    exports.flipDiagonal = flipDiagonal;
    function rotate180(s) {
      return s.rbit64();
    }
    exports.rotate180 = rotate180;
    function transformBoard(board$1, f) {
      const b = board.Board.empty();
      b.occupied = f(board$1.occupied);
      b.promoted = f(board$1.promoted);
      for (const color of types.COLORS) b[color] = f(board$1[color]);
      for (const role of types.ROLES) b[role] = f(board$1[role]);
      return b;
    }
    exports.transformBoard = transformBoard;
    function transformSetup(setup, f) {
      var _a, _b;
      return {
        board: transformBoard(setup.board, f),
        pockets:
          (_a = setup.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
        turn: setup.turn,
        unmovedRooks: f(setup.unmovedRooks),
        epSquare: util.defined(setup.epSquare)
          ? f(squareSet.SquareSet.fromSquare(setup.epSquare)).first()
          : undefined,
        remainingChecks:
          (_b = setup.remainingChecks) === null || _b === void 0
            ? void 0
            : _b.clone(),
        halfmoves: setup.halfmoves,
        fullmoves: setup.fullmoves,
      };
    }
    exports.transformSetup = transformSetup;
  });

  var variant = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupPosition = exports.defaultPosition = exports.Horde = exports.ThreeCheck = exports.KingOfTheHill = exports.Antichess = exports.Atomic = exports.Crazyhouse = exports.Castles = exports.Chess = exports.IllegalSetup = exports.PositionError = exports.Position = void 0;

    Object.defineProperty(exports, "PositionError", {
      enumerable: true,
      get: function () {
        return chess.PositionError;
      },
    });
    Object.defineProperty(exports, "Position", {
      enumerable: true,
      get: function () {
        return chess.Position;
      },
    });
    Object.defineProperty(exports, "IllegalSetup", {
      enumerable: true,
      get: function () {
        return chess.IllegalSetup;
      },
    });
    Object.defineProperty(exports, "Castles", {
      enumerable: true,
      get: function () {
        return chess.Castles;
      },
    });
    Object.defineProperty(exports, "Chess", {
      enumerable: true,
      get: function () {
        return chess.Chess;
      },
    });
    class Crazyhouse extends chess.Chess {
      constructor() {
        super("crazyhouse");
      }
      static default() {
        const pos = super.default();
        pos.pockets = setup.Material.empty();
        return pos;
      }
      static fromSetup(setup$1) {
        return super.fromSetup(setup$1).map((pos) => {
          pos.pockets = setup$1.pockets
            ? setup$1.pockets.clone()
            : setup.Material.empty();
          return pos;
        });
      }
      validate() {
        return super.validate().chain((_) => {
          if (
            this.pockets &&
            (this.pockets.white.king > 0 || this.pockets.black.king > 0)
          ) {
            return result_1__default["default"].Result.err(
              new chess.PositionError(chess.IllegalSetup.Kings)
            );
          }
          if (
            (this.pockets ? this.pockets.count() : 0) +
              this.board.occupied.size() >
            64
          ) {
            return result_1__default["default"].Result.err(
              new chess.PositionError(chess.IllegalSetup.Variant)
            );
          }
          return result_1__default["default"].Result.ok(undefined);
        });
      }
      clone() {
        return super.clone();
      }
      hasInsufficientMaterial(color) {
        // No material can leave the game, but we can easily check this for
        // custom positions.
        if (!this.pockets) return super.hasInsufficientMaterial(color);
        return (
          this.board.occupied.size() + this.pockets.count() <= 3 &&
          this.board.pawn.isEmpty() &&
          this.board.promoted.isEmpty() &&
          this.board.rooksAndQueens().isEmpty() &&
          this.pockets.white.pawn <= 0 &&
          this.pockets.black.pawn <= 0 &&
          this.pockets.white.rook <= 0 &&
          this.pockets.black.rook <= 0 &&
          this.pockets.white.queen <= 0 &&
          this.pockets.black.queen <= 0
        );
      }
      dropDests(ctx) {
        var _a, _b;
        const mask = this.board.occupied
          .complement()
          .intersect(
            (
              (_a = this.pockets) === null || _a === void 0
                ? void 0
                : _a[this.turn].hasNonPawns()
            )
              ? squareSet.SquareSet.full()
              : (
                  (_b = this.pockets) === null || _b === void 0
                    ? void 0
                    : _b[this.turn].hasPawns()
                )
              ? squareSet.SquareSet.backranks().complement()
              : squareSet.SquareSet.empty()
          );
        ctx = ctx || this.ctx();
        if (util.defined(ctx.king) && ctx.checkers.nonEmpty()) {
          const checker = ctx.checkers.singleSquare();
          if (!util.defined(checker)) return squareSet.SquareSet.empty();
          return mask.intersect(attacks_1.between(checker, ctx.king));
        } else return mask;
      }
    }
    exports.Crazyhouse = Crazyhouse;
    class Atomic extends chess.Chess {
      constructor() {
        super("atomic");
      }
      static default() {
        return super.default();
      }
      static fromSetup(setup) {
        return super.fromSetup(setup);
      }
      clone() {
        return super.clone();
      }
      validate() {
        // Like chess, but allow our king to be missing and any number of checkers.
        if (this.board.occupied.isEmpty())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Empty)
          );
        if (this.board.king.size() > 2)
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Kings)
          );
        const otherKing = this.board.kingOf(util.opposite(this.turn));
        if (!util.defined(otherKing))
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Kings)
          );
        if (
          this.kingAttackers(
            otherKing,
            this.turn,
            this.board.occupied
          ).nonEmpty()
        ) {
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.OppositeCheck)
          );
        }
        if (squareSet.SquareSet.backranks().intersects(this.board.pawn)) {
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.PawnsOnBackrank)
          );
        }
        return result_1__default["default"].Result.ok(undefined);
      }
      kingAttackers(square, attacker, occupied) {
        if (
          attacks_1
            .kingAttacks(square)
            .intersects(this.board.pieces(attacker, "king"))
        ) {
          return squareSet.SquareSet.empty();
        }
        return super.kingAttackers(square, attacker, occupied);
      }
      playCaptureAt(square, captured) {
        super.playCaptureAt(square, captured);
        this.board.take(square);
        for (const explode of attacks_1
          .kingAttacks(square)
          .intersect(this.board.occupied)
          .diff(this.board.pawn)) {
          const piece = this.board.take(explode);
          if (piece && piece.role === "rook") this.castles.discardRook(explode);
          if (piece && piece.role === "king")
            this.castles.discardSide(piece.color);
        }
      }
      hasInsufficientMaterial(color) {
        // Remaining material does not matter if the enemy king is already
        // exploded.
        if (this.board.pieces(util.opposite(color), "king").isEmpty())
          return false;
        // Bare king cannot mate.
        if (this.board[color].diff(this.board.king).isEmpty()) return true;
        // As long as the enemy king is not alone, there is always a chance their
        // own pieces explode next to it.
        if (this.board[util.opposite(color)].diff(this.board.king).nonEmpty()) {
          // Unless there are only bishops that cannot explode each other.
          if (
            this.board.occupied.equals(this.board.bishop.union(this.board.king))
          ) {
            if (
              !this.board.bishop
                .intersect(this.board.white)
                .intersects(squareSet.SquareSet.darkSquares())
            ) {
              return !this.board.bishop
                .intersect(this.board.black)
                .intersects(squareSet.SquareSet.lightSquares());
            }
            if (
              !this.board.bishop
                .intersect(this.board.white)
                .intersects(squareSet.SquareSet.lightSquares())
            ) {
              return !this.board.bishop
                .intersect(this.board.black)
                .intersects(squareSet.SquareSet.darkSquares());
            }
          }
          return false;
        }
        // Queen or pawn (future queen) can give mate against bare king.
        if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty())
          return false;
        // Single knight, bishop or rook cannot mate against bare king.
        if (
          this.board.knight
            .union(this.board.bishop)
            .union(this.board.rook)
            .isSingleSquare()
        )
          return true;
        // If only knights, more than two are required to mate bare king.
        if (
          this.board.occupied.equals(this.board.knight.union(this.board.king))
        ) {
          return this.board.knight.size() <= 2;
        }
        return false;
      }
      dests(square, ctx) {
        ctx = ctx || this.ctx();
        let dests = squareSet.SquareSet.empty();
        for (const to of this.pseudoDests(square, ctx)) {
          const after = this.clone();
          after.play({ from: square, to });
          const ourKing = after.board.kingOf(this.turn);
          if (
            util.defined(ourKing) &&
            (!util.defined(after.board.kingOf(after.turn)) ||
              after
                .kingAttackers(ourKing, after.turn, after.board.occupied)
                .isEmpty())
          ) {
            dests = dests.with(to);
          }
        }
        return dests;
      }
      isVariantEnd() {
        return !!this.variantOutcome();
      }
      variantOutcome(_ctx) {
        for (const color of types.COLORS) {
          if (this.board.pieces(color, "king").isEmpty())
            return { winner: util.opposite(color) };
        }
        return;
      }
    }
    exports.Atomic = Atomic;
    class Antichess extends chess.Chess {
      constructor() {
        super("antichess");
      }
      static default() {
        const pos = super.default();
        pos.castles = chess.Castles.empty();
        return pos;
      }
      static fromSetup(setup) {
        return super.fromSetup(setup).map((pos) => {
          pos.castles = chess.Castles.empty();
          return pos;
        });
      }
      clone() {
        return super.clone();
      }
      validate() {
        if (this.board.occupied.isEmpty())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Empty)
          );
        if (squareSet.SquareSet.backranks().intersects(this.board.pawn))
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.PawnsOnBackrank)
          );
        return result_1__default["default"].Result.ok(undefined);
      }
      kingAttackers(_square, _attacker, _occupied) {
        return squareSet.SquareSet.empty();
      }
      ctx() {
        const ctx = super.ctx();
        const enemy = this.board[util.opposite(this.turn)];
        for (const from of this.board[this.turn]) {
          if (this.pseudoDests(from, ctx).intersects(enemy)) {
            ctx.mustCapture = true;
            break;
          }
        }
        return ctx;
      }
      dests(square, ctx) {
        ctx = ctx || this.ctx();
        const dests = this.pseudoDests(square, ctx);
        if (!ctx.mustCapture) return dests;
        return dests.intersect(this.board[util.opposite(this.turn)]);
      }
      hasInsufficientMaterial(color) {
        if (this.board.occupied.equals(this.board.bishop)) {
          const weSomeOnLight = this.board[color].intersects(
            squareSet.SquareSet.lightSquares()
          );
          const weSomeOnDark = this.board[color].intersects(
            squareSet.SquareSet.darkSquares()
          );
          const theyAllOnDark = this.board[util.opposite(color)].isDisjoint(
            squareSet.SquareSet.lightSquares()
          );
          const theyAllOnLight = this.board[util.opposite(color)].isDisjoint(
            squareSet.SquareSet.darkSquares()
          );
          return (
            (weSomeOnLight && theyAllOnDark) || (weSomeOnDark && theyAllOnLight)
          );
        }
        return false;
      }
      isVariantEnd() {
        return this.board[this.turn].isEmpty();
      }
      variantOutcome(ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd || this.isStalemate(ctx)) {
          return { winner: this.turn };
        }
        return;
      }
    }
    exports.Antichess = Antichess;
    class KingOfTheHill extends chess.Chess {
      constructor() {
        super("kingofthehill");
      }
      static default() {
        return super.default();
      }
      static fromSetup(setup) {
        return super.fromSetup(setup);
      }
      clone() {
        return super.clone();
      }
      hasInsufficientMaterial(_color) {
        return false;
      }
      isVariantEnd() {
        return this.board.king.intersects(squareSet.SquareSet.center());
      }
      variantOutcome(_ctx) {
        for (const color of types.COLORS) {
          if (
            this.board
              .pieces(color, "king")
              .intersects(squareSet.SquareSet.center())
          )
            return { winner: color };
        }
        return;
      }
    }
    exports.KingOfTheHill = KingOfTheHill;
    class ThreeCheck extends chess.Chess {
      constructor() {
        super("3check");
      }
      static default() {
        const pos = super.default();
        pos.remainingChecks = setup.RemainingChecks.default();
        return pos;
      }
      static fromSetup(setup$1) {
        return super.fromSetup(setup$1).map((pos) => {
          pos.remainingChecks = setup$1.remainingChecks
            ? setup$1.remainingChecks.clone()
            : setup.RemainingChecks.default();
          return pos;
        });
      }
      clone() {
        return super.clone();
      }
      hasInsufficientMaterial(color) {
        return this.board.pieces(color, "king").equals(this.board[color]);
      }
      isVariantEnd() {
        return (
          !!this.remainingChecks &&
          (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0)
        );
      }
      variantOutcome(_ctx) {
        if (this.remainingChecks) {
          for (const color of types.COLORS) {
            if (this.remainingChecks[color] <= 0) return { winner: color };
          }
        }
        return;
      }
    }
    exports.ThreeCheck = ThreeCheck;
    class RacingKings extends chess.Chess {
      constructor() {
        super("racingkings");
      }
      static default() {
        const pos = new this();
        pos.board = board.Board.racingKings();
        pos.pockets = undefined;
        pos.turn = "white";
        pos.castles = chess.Castles.empty();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
      }
      static fromSetup(setup) {
        return super.fromSetup(setup).map((pos) => {
          pos.castles = chess.Castles.empty();
          return pos;
        });
      }
      validate() {
        if (this.isCheck())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.ImpossibleCheck)
          );
        if (this.board.pawn.nonEmpty())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Variant)
          );
        return super.validate();
      }
      clone() {
        return super.clone();
      }
      dests(square, ctx) {
        ctx = ctx || this.ctx();
        // Kings cannot give check.
        if (square === ctx.king) return super.dests(square, ctx);
        // TODO: This could be optimized considerably.
        let dests = squareSet.SquareSet.empty();
        for (const to of super.dests(square, ctx)) {
          // Valid, because there are no promotions (or even pawns).
          const move = { from: square, to };
          const after = this.clone();
          after.play(move);
          if (!after.isCheck()) dests = dests.with(to);
        }
        return dests;
      }
      hasInsufficientMaterial(_color) {
        return false;
      }
      isVariantEnd() {
        const goal = squareSet.SquareSet.fromRank(7);
        const inGoal = this.board.king.intersect(goal);
        if (inGoal.isEmpty()) return false;
        if (this.turn === "white" || inGoal.intersects(this.board.black))
          return true;
        // White has reached the backrank. Check if black can catch up.
        const blackKing = this.board.kingOf("black");
        if (util.defined(blackKing)) {
          const occ = this.board.occupied.without(blackKing);
          for (const target of attacks_1
            .kingAttacks(blackKing)
            .intersect(goal)
            .diff(this.board.black)) {
            if (this.kingAttackers(target, "white", occ).isEmpty())
              return false;
          }
        }
        return true;
      }
      variantOutcome(ctx) {
        if (ctx ? !ctx.variantEnd : !this.isVariantEnd()) return;
        const goal = squareSet.SquareSet.fromRank(7);
        const blackInGoal = this.board.pieces("black", "king").intersects(goal);
        const whiteInGoal = this.board.pieces("white", "king").intersects(goal);
        if (blackInGoal && !whiteInGoal) return { winner: "black" };
        if (whiteInGoal && !blackInGoal) return { winner: "white" };
        return { winner: undefined };
      }
    }
    class Horde extends chess.Chess {
      constructor() {
        super("horde");
      }
      static default() {
        const pos = new this();
        pos.board = board.Board.horde();
        pos.pockets = undefined;
        pos.turn = "white";
        pos.castles = chess.Castles.default();
        pos.castles.discardSide("white");
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
      }
      static fromSetup(setup) {
        return super.fromSetup(setup);
      }
      validate() {
        if (this.board.occupied.isEmpty())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Empty)
          );
        if (!this.board.king.isSingleSquare())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Kings)
          );
        if (!this.board.king.diff(this.board.promoted).isSingleSquare())
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.Kings)
          );
        const otherKing = this.board.kingOf(util.opposite(this.turn));
        if (
          util.defined(otherKing) &&
          this.kingAttackers(
            otherKing,
            this.turn,
            this.board.occupied
          ).nonEmpty()
        )
          return result_1__default["default"].Result.err(
            new chess.PositionError(chess.IllegalSetup.OppositeCheck)
          );
        for (const color of types.COLORS) {
          if (
            this.board
              .pieces(color, "pawn")
              .intersects(squareSet.SquareSet.backrank(util.opposite(color)))
          ) {
            return result_1__default["default"].Result.err(
              new chess.PositionError(chess.IllegalSetup.PawnsOnBackrank)
            );
          }
        }
        return this.validateCheckers();
      }
      clone() {
        return super.clone();
      }
      hasInsufficientMaterial(_color) {
        // TODO: Could detect cases where the horde cannot mate.
        return false;
      }
      isVariantEnd() {
        return this.board.white.isEmpty() || this.board.black.isEmpty();
      }
      variantOutcome(_ctx) {
        if (this.board.white.isEmpty()) return { winner: "black" };
        if (this.board.black.isEmpty()) return { winner: "white" };
        return;
      }
    }
    exports.Horde = Horde;
    function defaultPosition(rules) {
      switch (rules) {
        case "chess":
          return chess.Chess.default();
        case "antichess":
          return Antichess.default();
        case "atomic":
          return Atomic.default();
        case "horde":
          return Horde.default();
        case "racingkings":
          return RacingKings.default();
        case "kingofthehill":
          return KingOfTheHill.default();
        case "3check":
          return ThreeCheck.default();
        case "crazyhouse":
          return Crazyhouse.default();
      }
    }
    exports.defaultPosition = defaultPosition;
    function setupPosition(rules, setup) {
      switch (rules) {
        case "chess":
          return chess.Chess.fromSetup(setup);
        case "antichess":
          return Antichess.fromSetup(setup);
        case "atomic":
          return Atomic.fromSetup(setup);
        case "horde":
          return Horde.fromSetup(setup);
        case "racingkings":
          return RacingKings.fromSetup(setup);
        case "kingofthehill":
          return KingOfTheHill.fromSetup(setup);
        case "3check":
          return ThreeCheck.fromSetup(setup);
        case "crazyhouse":
          return Crazyhouse.fromSetup(setup);
      }
    }
    exports.setupPosition = setupPosition;
  });

  var chessops = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.variant = exports.transform = exports.san = exports.hash = exports.fen = exports.debug = exports.compat = exports.PositionError = exports.Position = exports.Chess = exports.Castles = exports.IllegalSetup = exports.defaultSetup = exports.RemainingChecks = exports.MaterialSide = exports.Material = exports.Board = exports.rookAttacks = exports.ray = exports.queenAttacks = exports.pawnAttacks = exports.knightAttacks = exports.kingAttacks = exports.bishopAttacks = exports.between = exports.attacks = exports.SquareSet = exports.squareRank = exports.squareFile = exports.roleToChar = exports.parseUci = exports.parseSquare = exports.opposite = exports.makeUci = exports.makeSquare = exports.defined = exports.charToRole = exports.RULES = exports.isNormal = exports.isDrop = exports.CASTLING_SIDES = exports.ROLES = exports.COLORS = exports.RANK_NAMES = exports.FILE_NAMES = void 0;

    Object.defineProperty(exports, "FILE_NAMES", {
      enumerable: true,
      get: function () {
        return types.FILE_NAMES;
      },
    });
    Object.defineProperty(exports, "RANK_NAMES", {
      enumerable: true,
      get: function () {
        return types.RANK_NAMES;
      },
    });
    Object.defineProperty(exports, "COLORS", {
      enumerable: true,
      get: function () {
        return types.COLORS;
      },
    });
    Object.defineProperty(exports, "ROLES", {
      enumerable: true,
      get: function () {
        return types.ROLES;
      },
    });
    Object.defineProperty(exports, "CASTLING_SIDES", {
      enumerable: true,
      get: function () {
        return types.CASTLING_SIDES;
      },
    });
    Object.defineProperty(exports, "isDrop", {
      enumerable: true,
      get: function () {
        return types.isDrop;
      },
    });
    Object.defineProperty(exports, "isNormal", {
      enumerable: true,
      get: function () {
        return types.isNormal;
      },
    });
    Object.defineProperty(exports, "RULES", {
      enumerable: true,
      get: function () {
        return types.RULES;
      },
    });

    Object.defineProperty(exports, "charToRole", {
      enumerable: true,
      get: function () {
        return util.charToRole;
      },
    });
    Object.defineProperty(exports, "defined", {
      enumerable: true,
      get: function () {
        return util.defined;
      },
    });
    Object.defineProperty(exports, "makeSquare", {
      enumerable: true,
      get: function () {
        return util.makeSquare;
      },
    });
    Object.defineProperty(exports, "makeUci", {
      enumerable: true,
      get: function () {
        return util.makeUci;
      },
    });
    Object.defineProperty(exports, "opposite", {
      enumerable: true,
      get: function () {
        return util.opposite;
      },
    });
    Object.defineProperty(exports, "parseSquare", {
      enumerable: true,
      get: function () {
        return util.parseSquare;
      },
    });
    Object.defineProperty(exports, "parseUci", {
      enumerable: true,
      get: function () {
        return util.parseUci;
      },
    });
    Object.defineProperty(exports, "roleToChar", {
      enumerable: true,
      get: function () {
        return util.roleToChar;
      },
    });
    Object.defineProperty(exports, "squareFile", {
      enumerable: true,
      get: function () {
        return util.squareFile;
      },
    });
    Object.defineProperty(exports, "squareRank", {
      enumerable: true,
      get: function () {
        return util.squareRank;
      },
    });

    Object.defineProperty(exports, "SquareSet", {
      enumerable: true,
      get: function () {
        return squareSet.SquareSet;
      },
    });

    Object.defineProperty(exports, "attacks", {
      enumerable: true,
      get: function () {
        return attacks_1.attacks;
      },
    });
    Object.defineProperty(exports, "between", {
      enumerable: true,
      get: function () {
        return attacks_1.between;
      },
    });
    Object.defineProperty(exports, "bishopAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.bishopAttacks;
      },
    });
    Object.defineProperty(exports, "kingAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.kingAttacks;
      },
    });
    Object.defineProperty(exports, "knightAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.knightAttacks;
      },
    });
    Object.defineProperty(exports, "pawnAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.pawnAttacks;
      },
    });
    Object.defineProperty(exports, "queenAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.queenAttacks;
      },
    });
    Object.defineProperty(exports, "ray", {
      enumerable: true,
      get: function () {
        return attacks_1.ray;
      },
    });
    Object.defineProperty(exports, "rookAttacks", {
      enumerable: true,
      get: function () {
        return attacks_1.rookAttacks;
      },
    });

    Object.defineProperty(exports, "Board", {
      enumerable: true,
      get: function () {
        return board.Board;
      },
    });

    Object.defineProperty(exports, "Material", {
      enumerable: true,
      get: function () {
        return setup.Material;
      },
    });
    Object.defineProperty(exports, "MaterialSide", {
      enumerable: true,
      get: function () {
        return setup.MaterialSide;
      },
    });
    Object.defineProperty(exports, "RemainingChecks", {
      enumerable: true,
      get: function () {
        return setup.RemainingChecks;
      },
    });
    Object.defineProperty(exports, "defaultSetup", {
      enumerable: true,
      get: function () {
        return setup.defaultSetup;
      },
    });

    Object.defineProperty(exports, "IllegalSetup", {
      enumerable: true,
      get: function () {
        return chess.IllegalSetup;
      },
    });
    Object.defineProperty(exports, "Castles", {
      enumerable: true,
      get: function () {
        return chess.Castles;
      },
    });
    Object.defineProperty(exports, "Chess", {
      enumerable: true,
      get: function () {
        return chess.Chess;
      },
    });
    Object.defineProperty(exports, "Position", {
      enumerable: true,
      get: function () {
        return chess.Position;
      },
    });
    Object.defineProperty(exports, "PositionError", {
      enumerable: true,
      get: function () {
        return chess.PositionError;
      },
    });
    exports.compat = compat;
    exports.debug = debug;
    exports.fen = fen;
    exports.hash = hash;
    exports.san = san;
    exports.transform = transform;
    exports.variant = variant;
  });

  var index = /*@__PURE__*/ getDefaultExportFromCjs(chessops);

  return index;
})(/*result*/ null);
//# sourceMappingURL=chessops.js.map
