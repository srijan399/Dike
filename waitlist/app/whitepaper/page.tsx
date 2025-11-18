import type { ReactNode } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { BlockMath, InlineMath } from "react-katex";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import CardBackground from "@/components/CardBackground";
import clsx from "clsx";
import "katex/dist/katex.min.css";

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

type SectionHeadingProps = {
    index: string;
    title: string;
    eyebrow?: string;
    description?: string;
};

type Concept = {
    term: string;
    summary: ReactNode;
    accent?: string;
};

const coreConcepts: Concept[] = [
    {
        term: "Prediction (Verse)",
        summary: (
            <>
                A binary market on a specific event within Paradigm&apos;s Multiverse Finance
                framework. Each verse is conditionally dependent on its parent outcome.
            </>
        ),
        accent: "Verse",
    },
    {
        term: "Stake (S)",
        summary: (
            <>
                Capital a participant locks into a prediction. Wins return <InlineMath math="S_i" /> plus
                profit; losses burn the stake.
            </>
        ),
    },
    {
        term: "Prediction Chain",
        summary: (
            <>
                An ordered sequence <InlineMath math="P_1, P_2, \ldots, P_n" /> where each child position is
                funded by a protocol loan collateralized by its parent stake, forming a DAG.
            </>
        ),
    },
    {
        term: "Loan (L)",
        summary: (
            <>
                Capital extended against collateral. For verse <InlineMath math="P_i" />, the protocol issues{" "}
                <InlineMath math="L_i = r \cdot S_i" /> which becomes <InlineMath math="S_{i+1}" />.
            </>
        ),
    },
    {
        term: "Collateralization Ratio (r)",
        summary: (
            <>
                Protocol parameter <InlineMath math={"0 < r < 1"} /> that caps leverage. Example:
                <InlineMath math="r = 0.6" /> unlocks 60% of posted collateral as a loan.
            </>
        ),
    },
    {
        term: "Health Ratio (HR)",
        summary: (
            <>
                Safety metric <InlineMath math="HR = \frac{V_1}{\sum L_i^{\\text{gross}}}" /> comparing the
                MTM value of the root collateral to total debt.
            </>
        ),
    },
];

const loanOutcomes: Concept[] = [
    {
        term: "Case A · Child Wins",
        summary: (
            <>
                Winnings repay <InlineMath math="L_i^{\\text{gross}}" /> immediately. Residual profit becomes
                withdrawable equity or fresh collateral for future chains.
            </>
        ),
        accent: "Win",
    },
    {
        term: "Case B · Child Loss",
        summary: (
            <>
                Stake <InlineMath math="S_{i+1}" /> is forfeited. The protocol seizes{" "}
                <InlineMath math="L_i^{\\text{gross}}" /> from parent collateral, reducing user equity in{" "}
                <InlineMath math="P_i" />.
            </>
        ),
        accent: "Loss",
    },
    {
        term: "Case C · Full Chain Wins",
        summary: (
            <>
                Every prediction resolves favorably; the user repays all outstanding loans and withdraws{" "}
                <InlineMath math="S_1 + \sum \\text{profits}" />.
            </>
        ),
        accent: "All Clear",
    },
];

const workedExampleSteps = [
    {
        label: "Parameters",
        details: [
            "Initial stake S₁ = $100",
            "Collateralization ratio r = 0.6",
            "Loan interest ρ = 5% per hop",
            "2x payout for winning predictions",
        ],
    },
    {
        label: "Propagation",
        details: [
            "Loan L₁ = 60 → Stake S₂ = $60",
            "Loan L₂ = 36 → Stake S₃ = $36",
            "Total deployed capital = $196 backed by $100",
        ],
    },
    {
        label: "Debt Stack",
        details: [
            "Loan principal = $96",
            "Gross obligation = 60·1.05 + 36·1.05 = $100.8",
            "HR trigger if V₁ < $100.8",
        ],
    },
    {
        label: "All Win Scenario",
        details: [
            "Payouts: $200 + $120 + $72 = $392",
            "Net after debt = $291.2",
            "Effective return ≈ 2.91x vs 2x siloed",
        ],
    },
    {
        label: "Liquidation Scenario",
        details: [
            "If V₁ = $95, HR = 0.94",
            "Protocol seizes S₁, repays $95 toward loans",
            "Chain unwinds, children forfeited",
        ],
    },
];

const references = [
    {
        label: "White, Dave. “Multiverse Finance.” Paradigm, 2022.",
        href: "https://www.paradigm.xyz/2025/05/multiverse-finance",
    },
];

const SectionHeading = ({ index, title, eyebrow, description }: SectionHeadingProps) => (
    <div className="space-y-4">
        <p className={`${instrumentSans.className} text-xs uppercase tracking-[0.35em] text-amber-300/80`}>
            {eyebrow ?? `Section ${index}`}
        </p>
        <h2 className={`${instrumentSerif.className} text-3xl font-semibold text-white`}>{`${index}. ${title}`}</h2>
        {description && <p className={`${instrumentSans.className} text-base leading-relaxed text-zinc-200`}>{description}</p>}
    </div>
);

type GradientCardProps = {
    children: ReactNode;
    index: number;
    variant?: "default" | "subtle" | "vibrant";
    radius?: "2xl" | "3xl";
    wrapperClassName?: string;
    contentClassName?: string;
};

const GradientCard = ({
    children,
    index,
    variant = "default",
    radius = "3xl",
    wrapperClassName = "",
    contentClassName = "",
}: GradientCardProps) => {
    const radiusClass = radius === "2xl" ? "rounded-2xl" : "rounded-3xl";
    return (
        <div className={clsx("relative", wrapperClassName)}>
            <CardBackground index={index} variant={variant} className={radiusClass} />
            <div className={clsx("glass-card relative z-10", radiusClass, contentClassName)}>{children}</div>
        </div>
    );
};

export default function WaitlistPage() {
    return (
        <div className={`${instrumentSans.className} relative min-h-screen text-white`}>
            <div className="fixed inset-0 z-0">
                <GrainGradient
                    width="100%"
                    height="100%"
                    colors={["#D00613", "#FFBF02"]}
                    colorBack="#000a0f"
                    softness={0.7}
                    intensity={0.15}
                    noise={0.8}
                    shape="wave"
                    speed={0}
                    frame={0}
                    offsetX={0.44}
                    offsetY={1}
                />
            </div>

            <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-12">
                <header className="space-y-8 text-center lg:text-left">
                    <div className={`${instrumentSans.className} mx-auto w-fit rounded-full border border-white/20 px-4 py-1 text-xs tracking-[0.3em] text-white/70 lg:mx-0`}>
                        DIKE PROTOCOL · WHITEPAPER v2.1
                    </div>
                    <div className="space-y-6">
                        <h1 className={`${instrumentSerif.className} text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl`}>
                            A Framework for Capital-Efficient Chained Prediction Markets
                        </h1>
                        <p className={`${instrumentSans.className} text-lg leading-relaxed text-zinc-100 sm:text-xl`}>
                            Multiverse-inspired leverage that recycles collateral down conditional universes, unlocking compounded exposures without fresh capital.
                        </p>
                    </div>
                    <div className={`${instrumentSans.className} grid gap-4 text-sm uppercase tracking-[0.2em] text-white/70 sm:grid-cols-3`}>
                        <div className="glass-chip rounded-full px-4 py-2 text-center">Version · 2.1.0</div>
                        <div className="glass-chip rounded-full px-4 py-2 text-center">Runtime · ~7 min read</div>
                        <div className="glass-chip rounded-full px-4 py-2 text-center">Updated · Nov 2025</div>
                    </div>
                </header>

                <section className="mt-16 grid gap-8 lg:grid-cols-[2.1fr_1fr]">
                    <GradientCard index={0} contentClassName="p-8 shadow-2xl ring-1 ring-white/10">
                        <SectionHeading
                            index="Abstract"
                            title="Protocol Synopsis"
                            eyebrow="Abstract"
                            description="DIKE operationalizes Multiverse Finance into a programmable loan primitive that reuses collateral across conditional predictions."
                        />
                        <div className={`${instrumentSans.className} mt-8 space-y-6 text-base leading-relaxed text-zinc-100`}>
                            <p>
                                Traditional prediction markets strand capital inside each position. DIKE introduces Prediction Chaining:
                                the collateral from a resolved or mark-to-market winning verse backs a protocol loan that fuels the next bet.
                                Because each child inherits risk from its parent, a single unit of staked value can support multiple sequential exposures.
                            </p>
                            <p>
                                This paper formalizes the mechanism design, detailing the recursive loan schedule, settlement paths, liquidation thresholds,
                                and worked economics of a three-link chain. The result is a composable primitive for building structured prediction products
                                with transparent risk envelopes.
                            </p>
                        </div>
                    </GradientCard>

                    <GradientCard
                        index={1}
                        variant="subtle"
                        contentClassName={`${instrumentSans.className} p-6 text-sm text-zinc-100 h-full`}
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Quick Stats</p>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <p className="text-3xl font-semibold text-white">0.6x</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Reference collateral ratio</p>
                            </li>
                            <li>
                                <p className="text-3xl font-semibold text-white">HR ≥ 1</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Liquidation guardrail</p>
                            </li>
                            <li>
                                <p className="text-3xl font-semibold text-white">2.91x</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Return in worked example</p>
                            </li>
                            <li>
                                <p className="text-3xl font-semibold text-white">4.98x</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Max return in simulations</p>
                            </li>
                            <li>
                                <p className="text-3xl font-semibold text-white">3 links</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Chain depth in case study</p>
                            </li>
                        </ul>
                    </GradientCard>
                </section>

                <section className="mt-20 space-y-12">
                    <SectionHeading
                        index="1"
                        title="Introduction"
                        description="Prediction markets aggregate belief but trap capital per position. DIKE reuses that collateral through under-collateralized protocol loans, preserving solvency with deterministic controls."
                    />
                    <GradientCard
                        index={2}
                        variant="subtle"
                        contentClassName={`${instrumentSans.className} p-8 text-base leading-relaxed text-zinc-100`}
                    >
                        <p>
                            Capital inefficiency is the dominant drag on prediction market adoption. A user chasing multiple themes must fund each venue separately,
                            idling their bankroll until results finalize. DIKE addresses this deadweight loss by chaining positions.
                            The moment a stake acquires positive equity, a user may borrow against it to seed the next universe,
                            effectively cascading exposure down a deterministic decision tree.
                        </p>
                        <p className="mt-6">
                            The architecture mirrors Paradigm&apos;s Multiverse Finance proposal but adds production-ready logic—tracking loan principal,
                            accruing interest, stress-testing HR, and enforcing DAG constraints so that no child exists without a solvent parent.
                        </p>
                    </GradientCard>
                </section>

                <section className="mt-20 space-y-10">
                    <SectionHeading
                        index="2"
                        title="Core Concepts & Terminology"
                        description="The vocabulary below grounds the rest of the mechanism. Every definition maps to on-chain state the protocol tracks."
                    />
                    <div className="grid items-stretch gap-6 md:grid-cols-2">
                        {coreConcepts.map((concept, idx) => (
                            <GradientCard
                                key={concept.term}
                                index={11}
                                variant="subtle"
                                radius="2xl"
                                wrapperClassName="h-full"
                                contentClassName={`${instrumentSans.className} flex h-full flex-col p-6`}
                            >
                                <p className={`${instrumentSans.className} text-xs uppercase tracking-[0.25em] text-amber-200`}>{concept.term}</p>
                                <div className="mt-4 text-sm leading-relaxed text-zinc-100">{concept.summary}</div>
                            </GradientCard>
                        ))}
                    </div>
                </section>

                <section className="mt-20 space-y-12">
                    <SectionHeading
                        index="3"
                        title="Protocol Mechanism"
                        description="A chain is governed by deterministic formulas for loan sizing, recursive stake propagation, settlement, and liquidation."
                    />

                    <div className="space-y-8">
                        <GradientCard index={20} variant="vibrant" contentClassName="p-8">
                            <h3 className={`${instrumentSerif.className} text-xl font-semibold text-white`}>3.1 Chain Initiation</h3>
                            <p className={`${instrumentSans.className} mt-4 text-zinc-100`}>
                                A user deposits <InlineMath math="S_1" /> into the root prediction <InlineMath math="P_1" />. This stake represents the only exogenous capital in the chain and becomes the collateral base for all downstream loans:
                            </p>
                            <div className="mt-6 rounded-2xl bg-black/40 p-6">
                                <BlockMath math="S_1 = \text{Initial User Capital}" />
                            </div>
                        </GradientCard>

                        <GradientCard index={21} contentClassName="p-8">
                            <h3 className={`${instrumentSerif.className} text-xl font-semibold text-white`}>3.2 Chain Propagation (Leveraging)</h3>
                            <p className={`${instrumentSans.className} mt-4 text-zinc-100`}>
                                Once <InlineMath math="P_1" /> is live, DIKE extends a loan <InlineMath math="L_1" /> equal to a fraction <InlineMath math="r" /> of the staked value. The loan becomes the stake for the child prediction <InlineMath math="P_2" />. Recursively:
                            </p>
                            <div className="mt-6 space-y-4 rounded-2xl bg-black/40 p-6">
                                <BlockMath math="L_i = r \cdot S_i" />
                                <BlockMath math="S_{i+1} = L_i = r \cdot S_i" />
                                <BlockMath math="S_i = S_1 \cdot r^{\,i-1}" />
                                <BlockMath math="\sum_{i=1}^{n} S_i = S_1 \cdot \frac{1 - r^{n}}{1 - r}" />
                            </div>
                            <p className={`${instrumentSans.className} mt-4 text-sm text-zinc-300`}>
                                The entire stack therefore compounds exposure while remaining deterministically backed by the root capital.
                            </p>
                        </GradientCard>

                        <GradientCard index={22} variant="subtle" contentClassName="p-8">
                            <h3 className={`${instrumentSerif.className} text-xl font-semibold text-white`}>3.3 Position Resolution & Settlement</h3>
                            <p className={`${instrumentSans.className} mt-4 text-zinc-100`}>
                                Settlement happens verse-by-verse. Define the gross loan as principal plus accrued interest:
                            </p>
                            <div className="mt-6 rounded-2xl bg-black/40 p-6">
                                <BlockMath math="L_i^{\text{gross}} = L_i \cdot e^{\rho \Delta t}" />
                            </div>
                            <div className="mt-6 grid items-stretch gap-4 md:grid-cols-3">
                                {loanOutcomes.map((item, idx) => (
                                    <GradientCard
                                        key={item.term}
                                        index={30 + idx}
                                        variant="subtle"
                                        radius="2xl"
                                        wrapperClassName="h-full"
                                        contentClassName={`${instrumentSans.className} flex h-full flex-col p-6`}
                                    >
                                        <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{item.term}</p>
                                        <div className="mt-4 text-sm text-zinc-100">{item.summary}</div>
                                    </GradientCard>
                                ))}
                            </div>
                        </GradientCard>

                        <GradientCard index={23} variant="subtle" contentClassName="p-8">
                            <h3 className={`${instrumentSerif.className} text-xl font-semibold text-white`}>3.4 Liquidation</h3>
                            <p className={`${instrumentSans.className} mt-4 text-zinc-100`}>
                                DIKE monitors the mark-to-market value of the root position <InlineMath math="V_1" /> relative to the aggregate debt.
                                When the Health Ratio breaches the liquidation threshold, the protocol seizes collateral, repays loans, and collapses the chain.
                            </p>
                            <div className="mt-6 rounded-2xl bg-black/40 p-6">
                                <BlockMath math="L_{\text{total}}^{\text{gross}} = \sum_{i=1}^{n-1} L_i^{\text{gross}}" />
                                <BlockMath math="HR = \frac{V_1}{L_{\text{total}}^{\text{gross}}}" />
                            </div>
                            <p className={`${instrumentSans.className} mt-4 text-sm text-zinc-300`}>
                                Example guardrail: liquidate if <InlineMath math={"HR < 1"} />, ensuring the protocol never carries under-collateralized debt.
                            </p>
                        </GradientCard>
                    </div>
                </section>

                <section className="mt-20 space-y-10">
                    <SectionHeading
                        index="4"
                        title="Worked Example"
                        description="A three-link chain demonstrates leverage recycling, payoff asymmetry, and liquidation sensitivity."
                    />
                    <GradientCard index={40} contentClassName="p-8">
                        <div className="grid items-stretch gap-6 md:grid-cols-2">
                            {workedExampleSteps.map((step, idx) => (
                                <GradientCard
                                    key={step.label}
                                    index={50}
                                    variant="subtle"
                                    radius="2xl"
                                    wrapperClassName="h-full"
                                    contentClassName={`${instrumentSans.className} flex h-full flex-col p-6`}
                                >
                                    <div className="text-xs uppercase tracking-[0.3em] text-amber-200">{step.label}</div>
                                    <ul className="mt-4 space-y-2 text-sm text-zinc-100">
                                        {step.details.map((detail) => (
                                            <li key={detail} className="flex items-start gap-2">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </GradientCard>
                            ))}
                        </div>
                        <GradientCard
                            index={60}
                            variant="subtle"
                            radius="2xl"
                            wrapperClassName="mt-8"
                            contentClassName={`${instrumentSans.className} p-6 text-sm text-zinc-100`}
                        >
                            <p className={`${instrumentSerif.className} font-semibold text-white`}>Key Takeaway</p>
                            <p className="mt-2">
                                Recycling collateral via <InlineMath math="r = 0.6" /> transforms a $100 stake into $196 of total exposure without additional user capital,
                                yielding a 2.91x payoff when all predictions win while retaining deterministic liquidation if the root MTM deteriorates.
                            </p>
                        </GradientCard>
                    </GradientCard>
                </section>

                <section className="mt-20 space-y-10">
                    <SectionHeading
                        index="5"
                        title="Conclusion"
                        description="Prediction Chaining turns Multiverse theory into live financial plumbing for capital-efficient speculation."
                    />
                    <GradientCard
                        index={70}
                        contentClassName={`${instrumentSans.className} p-8 text-base text-zinc-100`}
                    >
                        <p>
                            DIKE delivers a solvency-aware leverage rail for prediction markets. Transparent ratios, deterministic settlement semantics,
                            and chain-level liquidation logic keep the protocol neutral while letting users amplify directional views with a single deposit.
                        </p>
                        <p className="mt-6">
                            Upcoming iterations extend the primitive with oracle-driven MTM updates, configurable interest curves, and composable vault products layered on top of Prediction Chains.
                        </p>
                    </GradientCard>
                </section>

                <section className="mt-20 space-y-8">
                    <SectionHeading index="6" title="References" description="Primary research underpinning DIKE." />
                    <GradientCard index={80} contentClassName="p-6">
                        <ul className={`${instrumentSans.className} space-y-4 text-sm text-amber-100`}>
                            {references.map((ref) => (
                                <li key={ref.href}>
                                    <a className="underline decoration-dotted underline-offset-4 transition hover:text-white" href={ref.href} target="_blank" rel="noreferrer">
                                        {ref.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </GradientCard>
                </section>
            </main>
        </div>
    );
}