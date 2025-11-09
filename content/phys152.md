# Physics 152 – Student-Facing Course Content

Designed for Axis. Each sub-unit follows a consistent template: Why it matters → Key results → Worked example → Common pitfalls → Quick checks.

## 1) Coulomb's Law & Electric Field

### 1.1 Point Charges & Superposition

**Why it matters.** Point charges are the building blocks of electrostatics. Superposition lets you add fields from many sources linearly.

**Key results.** Coulomb's law (magnitude) $F=k|q_1q_2|/r^2$. Electric field of a point charge: $E(r)=kq\hat{r}/r^2$. Principle of superposition: total field is the vector sum from each charge. Field is conservative; $\nabla \times E=0$ in electrostatics.

**Worked example.** Two charges on x-axis: $q$ at $+a$ and $-q$ at $-a$. On the y-axis at $y$, fields from each are equal in magnitude and horizontal components cancel. Net field is vertical with magnitude $E_y=2kqa/(a^2+y^2)^{3/2}$. This is a dipole-on-axis field preview.

**Pitfalls.** (i) Forgetting vector directions. (ii) Using scalar addition for vectors. (iii) Mixing $r$ (distance) with coordinate components.

**Quick checks.** (1) If both charges are +q, is the mid-point field zero? (No; forces cancel, field does not.) (2) Units of $k$? $Nm^2/C^2$.

### 1.2 Continuous Charge Distributions

**Why it matters.** Real objects aren't point charges. Use densities to integrate.

**Key results.** Linear: $dQ=\lambda dl$. Surface: $dQ=\sigma dA$. Volume: $dQ=\rho dV$. Field $E(r)=k\int (dQ)\hat{R}/R^2$.

**Worked example.** Finite line of length $2a$ on x-axis with $\lambda$. Field on the perpendicular bisector distance y: $E_y=2k\lambda a/(y\sqrt{a^2+y^2})$, horizontal components cancel.

**Pitfalls.** (i) Failing to exploit symmetry to drop components. (ii) Wrong distance $R$ in denominator. (iii) Not normalizing limits properly.

**Quick checks.** As $y \to \infty$, does $E$ go like $1/y^2$? Yes—behaves like a point charge $Q=2\lambda a$.

### 1.3 Electric Field Lines & Flux

**Why it matters.** Qualitative field reasoning + the bridge to Gauss's law.

**Key results.** Field lines begin on + charges, end on − charges, never cross; density ∝ |E|. Electric flux through a surface: $\Phi_E=\int E \cdot dA$.

**Worked example.** Uniform field $E=E_0\hat{x}$ through a square of area $A$ whose normal makes angle $\theta$ with $\hat{x}$: $\Phi_E=E_0A\cos\theta$.

**Pitfalls.** (i) Confusing area vector direction. (ii) Treating flux as "number of lines" literally—use it as a proportional picture.

**Quick checks.** Flux of any closed surface in uniform field with no enclosed charge is zero? Yes (equal in/out).

### 1.4 Electric Dipoles & Torque

**Why it matters.** Molecules and dielectrics behave like dipoles; fields of many bodies far away look dipolar.

**Key results.** Dipole moment $p=qd$. Torque in uniform $E$: $\tau=p \times E$. Potential energy: $U=-p \cdot E$. On-axis field $E_{axis}=2kp/r^3$; on-equator $E_\perp=kp/r^3$.

**Worked example.** Small dipole in $E=E_0\hat{x}$ initially at angle $\theta_0$. Show equilibrium at $\theta=0$ (stable) and $\pi$ (unstable) via second derivative of $U$.

**Pitfalls.** Using $1/r^2$ scaling for dipoles—true only for point charges. Dipoles go like $1/r^3$.

**Quick checks.** Does a pure dipole in uniform field translate? No (net force 0), but it can rotate.

## 2) Gauss's Law

### 2.1 Gauss's Law Statement & Strategy

**Why it matters.** Converts difficult integrals into simple algebra when symmetry is high.

**Key results.** $\oint_S E \cdot dA=Q_{enc}/\varepsilon_0$. Choose Gaussian surfaces that match symmetry (spherical, cylindrical, planar) so $E$ is constant over surface parts and/or $E \cdot dA$ is simple.

**Worked example.** Infinite line with $\lambda$: cylinder radius r, length L → $E(2\pi rL)=\lambda L/\varepsilon_0 \Rightarrow E=\lambda/(2\pi\varepsilon_0 r)$.

**Pitfalls.** (i) Using Gauss's law without symmetry—still true but not useful. (ii) Miscounting enclosed charge.

**Quick checks.** If $Q_{enc}=0$, must $\oint E \cdot dA=0$? Yes; but $E$ locally need not be zero.

### 2.2 Spherical Symmetry

**Why it matters.** Many charge distributions have spherical symmetry, making Gauss's law particularly powerful.

**Key results.** For an isolated sphere or spherical shell: $E(r)=kQ/r^2$ for $r>R$. For a solid sphere with uniform $\rho$: inside $E(r)=kQr/R^3$ (linear in r). Shell interior ($r<R_{inner}$) has $E=0$.

**Worked example.** Solid insulating sphere radius R, charge Q uniform. Show continuity of $E$ at $r=R$ and sketch.

**Pitfalls.** Forgetting that fields inside a conducting shell are zero (charges reside on surface in electrostatics).

**Quick checks.** Why does $E$ go to zero at the center of a uniform sphere? (Equal charge on all sides cancels.)

### 2.3 Planar & Cylindrical Symmetry

**Why it matters.** Infinite planes and cylinders are common idealizations with exact solutions.

**Key results.** Planes. Infinite sheet surface density $\sigma$: $E=\sigma/(2\varepsilon_0)$ on each side, direction normal. Slab. Infinite slab of thickness 2a with uniform $\rho$: inside $E=\rho x/\varepsilon_0$ (linear), outside $E=\rho a/\varepsilon_0$ constant. Cylinder. Solid with $\rho$: $E(r)=\rho r/(2\varepsilon_0)$ inside; $E(r)=\rho R^2/(2\varepsilon_0 r)$ outside.

**Worked example.** Compute field inside and outside a uniformly charged infinite cylinder.

**Pitfalls.** Applying sheet formula to finite plates without edge corrections.

**Quick checks.** Why does an infinite plane have constant field? (Symmetry requires it.)

## 3) Electric Potential

### 3.1 Potential, Work, and Conservative Fields

**Why it matters.** Potential is a scalar, making calculations often simpler than vector fields.

**Key results.** $\Delta V=-\int_a^b E \cdot dl$. For point charge: $V(r)=kQ/r$ (choose $V(\infty)=0$). Work by field: $W=q\Delta V$ (signs matter!).

**Worked example.** Bring a charge q from $r=a$ to $r=b$ near Q: $\Delta U=qkQ(1/b-1/a)$.

**Pitfalls.** Mixing potential $V$ (per charge) with potential energy $U=qV$.

**Quick checks.** Can potential be negative? Yes—it's relative to the reference point.

### 3.2 Equipotentials & Field from Potential

**Why it matters.** Equipotentials help visualize fields, and $E=-\nabla V$ connects them mathematically.

**Key results.** Equipotentials are perpendicular to field lines. $E=-\nabla V$. Numerically, use finite differences; analytically, compute gradients.

**Worked example.** Potential $V(x,y)=V_0(x^2-y^2)$. Then $E=-2V_0(x\hat{x}-y\hat{y})$.

**Pitfalls.** Thinking large $|V|$ means large $|E|$. Only large gradients of V imply strong E.

**Quick checks.** If equipotentials are close together, is the field strong? Yes—steep gradient.

### 3.3 Potential of Continuous Distributions

**Why it matters.** Scalar integrals are often easier than vector field calculations.

**Key results.** $V(r)=k\int dQ/R$ (scalar integral—easier than field). Field recovered via gradient.

**Worked example.** Ring radius a with total charge Q on axis z: $V(z)=kQ/\sqrt{a^2+z^2}$, $E_z=-\partial V/\partial z=kQz/(a^2+z^2)^{3/2}$.

**Pitfalls.** Forgetting the scalar nature—no vector addition needed, just sum contributions.

**Quick checks.** Why is potential easier to compute than field? (Scalar vs vector integration.)

## 4) Energy & Capacitors (Intro)

### 4.1 Electric Potential Energy of Charge Configurations

**Why it matters.** Understanding energy helps predict stability and forces.

**Key results.** Pair energy: $U=k\sum_{i<j}q_iq_j/r_{ij}$. Continuous: $U=\frac{\varepsilon_0}{2}\int E^2 dV$.

**Worked example.** Energy to assemble three charges at triangle corners; compare to field-energy integral numerically.

**Pitfalls.** Double-counting pairs in discrete sums.

**Quick checks.** Is energy always positive? No—opposite charges have negative potential energy.

### 4.2 Definition of Capacitance, Parallel-Plate Model

**Why it matters.** Capacitors store energy and are fundamental circuit elements.

**Key results.** $C \equiv Q/\Delta V$. Parallel plates (area A, separation d): $C=\varepsilon_0 A/d$. Stored energy: $U=\frac{1}{2}CV^2=\frac{Q^2}{2C}=\frac{1}{2}QV$.

**Worked example.** Calculate capacitance and stored energy for given plate dimensions.

**Pitfalls.** Confusing what is held constant (Q vs V) when inserting dielectrics.

**Quick checks.** Does larger area increase or decrease capacitance? Increase.

### 4.3 Series & Parallel Combinations

**Why it matters.** Real circuits use multiple capacitors.

**Key results.** Parallel: $C_{eq}=\sum C_i$. Series: $1/C_{eq}=\sum 1/C_i$. Voltage splits in series; charge is common.

**Worked example.** Two capacitors 2 µF and 3 µF in series at 12 V → $C_{eq}=1.2$ µF; charges equal $Q=14.4$ µC.

**Pitfalls.** Mixing up series and parallel formulas.

**Quick checks.** Which gives larger equivalent capacitance: series or parallel? Parallel.

## 5) Capacitors & Dielectrics (Full)

### 5.1 Dielectric Constant & Polarization

**Why it matters.** Dielectrics increase capacitance and are essential in real devices.

**Key results.** $D=\varepsilon E=\varepsilon_0 E+P$. For linear dielectrics, $\varepsilon=\kappa\varepsilon_0$. Bound charge densities: $\rho_b=-\nabla \cdot P$, $\sigma_b=P \cdot \hat{n}$.

**Worked example.** Slab inserted between plates: new capacitance $C=\kappa\varepsilon_0 A/d$.

**Pitfalls.** Confusing free vs bound charge.

**Quick checks.** Does dielectric always increase capacitance? Yes, if $\kappa>1$.

### 5.2 Energy & Forces with Dielectrics

**Why it matters.** Understanding forces helps design devices and predict behavior.

**Key results.** At fixed V, plates attract dielectric (force pulls in); at fixed Q, they may push out. Energy method: compare $U=\frac{1}{2}CV^2$ or $U=Q^2/(2C)$ before/after.

**Worked example.** Half-inserted dielectric slab: compute force via $-dU/dx$.

**Pitfalls.** Not specifying whether Q or V is held constant.

**Quick checks.** Does force depend on whether battery is connected? Yes—different constraints.

### 5.3 Capacitors of Other Geometries

**Why it matters.** Different geometries have different applications.

**Key results.** Coaxial: $C=2\pi\varepsilon L/\ln(b/a)$. Spherical: $C=4\pi\varepsilon ab/(b-a)$.

**Worked example.** Calculate capacitance for given geometry dimensions.

**Pitfalls.** Using wrong formula for geometry.

**Quick checks.** Which geometry has highest capacitance for given volume? Depends on dimensions.

## 6) Vector Calculus Tools

### 6.1 Gradient, Divergence, Curl (Electrostatics Context)

**Why it matters.** Vector calculus is the language of electromagnetism.

**Key results.** $E=-\nabla V$; $\nabla \cdot E=\rho/\varepsilon_0$; $\nabla \times E=0$. Units and physical meaning (sources/sinks, rotation).

**Worked example.** Verify $\nabla \cdot (kQ\hat{r}/r^2)=4\pi kQ \delta^3(r)$ using divergence theorem.

**Pitfalls.** Mixing up gradient, divergence, and curl operations.

**Quick checks.** What does $\nabla \times E=0$ tell us? Field is conservative.

### 6.2 Integral Theorems

**Why it matters.** Integral theorems connect local and global properties.

**Key results.** Gradient theorem, Divergence theorem (Gauss), Stokes' theorem. Strategy: choose surfaces/paths aligned with symmetry.

**Worked example.** From $\nabla \times E=0$ derive path-independence of $\int E \cdot dl$.

**Pitfalls.** Applying wrong theorem to problem.

**Quick checks.** Which theorem relates flux to divergence? Divergence (Gauss) theorem.

### 6.3 Laplace's & Poisson's Equations

**Why it matters.** These are fundamental equations for finding potentials.

**Key results.** $\nabla^2 V=-\rho/\varepsilon_0$. Solutions in charge-free regions obey Laplace (mean value property, no local extrema).

**Worked example.** 2D separation for a rectangular box with boundary conditions.

**Pitfalls.** Forgetting boundary conditions.

**Quick checks.** What is Laplace's equation? $\nabla^2 V=0$.

## 7) DC Circuits: Resistance & Networks

### 7.1 Ohm's Law, Microscopic View

**Why it matters.** Understanding current flow at microscopic level explains macroscopic behavior.

**Key results.** $V=IR$, $R=\rho L/A$. Drift velocity and current density $J=\sigma E$.

**Worked example.** Wire gauge change → compute resistance and power loss $P=I^2R$.

**Pitfalls.** Confusing resistivity $\rho$ with charge density.

**Quick checks.** Does thicker wire have more or less resistance? Less.

### 7.2 Kirchhoff's Rules & Loop Analysis

**Why it matters.** Essential for analyzing complex circuits.

**Key results.** Node rule: $\sum I_{in}=\sum I_{out}$. Loop rule: $\sum \Delta V=0$. Sign conventions and solving linear systems.

**Worked example.** Two-loop circuit with shared resistor; write equations, solve for currents, check power.

**Pitfalls.** Sign errors in loop equations.

**Quick checks.** How many independent loop equations? Number of loops minus number of current sources.

### 7.3 Thevenin/Norton Equivalents & Power

**Why it matters.** Simplifies complex networks for analysis.

**Key results.** Reduce networks to source + resistance. Maximum power transfer at $R_L=R_{th}$.

**Worked example.** Find Thevenin equivalent and maximum power.

**Pitfalls.** Forgetting to remove load when finding equivalent.

**Quick checks.** When is power maximum? When load equals Thevenin resistance.

## 8) RC Circuits

### 8.1 Charging & Discharging Dynamics

**Why it matters.** RC circuits are everywhere in electronics.

**Key results.** Differential equations: $\tau=RC$. Charging: $q(t)=CV_0(1-e^{-t/\tau})$. Discharging: $q(t)=q_0e^{-t/\tau}$.

**Worked example.** Time to reach 90% of final voltage: $t=\tau\ln 10$.

**Pitfalls.** Confusing charging vs discharging equations.

**Quick checks.** What is the time constant? $RC$.

### 8.2 Step & Pulse Responses, Measurement

**Why it matters.** Real circuits respond to time-varying inputs.

**Key results.** Superposition for piecewise-constant sources. Read scope traces; estimate $R$ or $C$ from slopes.

**Worked example.** Analyze step response and extract parameters.

**Pitfalls.** Not accounting for initial conditions.

**Quick checks.** How does pulse width compare to time constant affect response? Determines if fully charges.

### 8.3 Energy & Power in Transients

**Why it matters.** Understanding energy flow in time-dependent circuits.

**Key results.** Instantaneous power in resistor $i^2R$; energy delivered by source equals increase in capacitor energy plus heat.

**Worked example.** Calculate energy transfer during charging.

**Pitfalls.** Forgetting that not all source energy goes to capacitor.

**Quick checks.** Where does the "lost" energy go? Heat in resistor.

## 9) Magnetic Fields & Forces

### 9.1 Lorentz Force & Motion in Uniform B

**Why it matters.** Magnetic forces govern charged particle motion.

**Key results.** $F=q(E+v \times B)$. For $E=0$, uniform $B$: circular motion radius $r=mv/(|q|B)$, cyclotron frequency $\omega=|q|B/m$.

**Worked example.** Velocity selector: choose $E$ and $B$ so only $v=E/B$ passes straight.

**Pitfalls.** Forgetting right-hand rule for direction.

**Quick checks.** What shape is the path in uniform B? Circle (or helix if $v_\parallel \neq 0$).

### 9.2 Magnetic Force on Currents & Torque on Loops

**Why it matters.** Motors and generators rely on these forces.

**Key results.** Force on segment: $dF=Idl \times B$. Torque on loop: $\tau=\mu \times B$, ($\mu=IA\hat{n}$).

**Worked example.** Rectangular loop near long wire—direction of net force/torque.

**Pitfalls.** Wrong direction from cross product.

**Quick checks.** When is torque maximum? When $\mu$ perpendicular to $B$.

### 9.3 Magnetic Dipoles & Potential Energy

**Why it matters.** Understanding energy helps predict orientation.

**Key results.** $U=-\mu \cdot B$. Stable alignment parallel to $B$.

**Worked example.** Show energy minimum at parallel alignment.

**Pitfalls.** Sign errors in energy expression.

**Quick checks.** Does dipole align with or against field? With (lowest energy).

## 10) Fields of Currents

### 10.1 Biot–Savart Law

**Why it matters.** Calculates magnetic fields from arbitrary current distributions.

**Key results.** $dB=\frac{\mu_0}{4\pi}\frac{Idl \times \hat{R}}{R^2}$. Use for finite/curved elements where Ampère is hard.

**Worked example.** Field on axis of a circular loop: $B=\mu_0 Ia^2/(2(a^2+z^2)^{3/2})$.

**Pitfalls.** Vector direction from cross product.

**Quick checks.** Does field go to zero at center of loop? No—it's maximum.

### 10.2 Ampère's Law (Magnetostatics)

**Why it matters.** Simplifies field calculations with symmetry.

**Key results.** $\oint B \cdot dl=\mu_0 I_{enc}$. Infinite wire: $B=\mu_0 I/(2\pi r)$. Solenoid (ideal): $B=\mu_0 nI$ inside, ~0 outside.

**Worked example.** Use Ampère's law for symmetric current distributions.

**Pitfalls.** Applying without sufficient symmetry.

**Quick checks.** What symmetry is needed? Current must have translational or rotational symmetry.

### 10.3 Magnetic Materials (Brief)

**Why it matters.** Materials affect magnetic fields in devices.

**Key results.** Paramagnetic, diamagnetic, ferromagnetic; $B=\mu H=\mu_0(H+M)$.

**Worked example.** Compare behavior of different material types.

**Pitfalls.** Confusing $B$ and $H$.

**Quick checks.** Which materials enhance field? Ferromagnetic.

## 11) Faraday's Law & Induction

### 11.1 Faraday's Law & Lenz's Rule

**Why it matters.** Changing magnetic fields create electric fields.

**Key results.** $\mathcal{E}=-d\Phi_B/dt$, $\Phi_B=\int B \cdot dA$. Lenz's rule sets the sign to oppose flux changes.

**Worked example.** Loop pulled from a uniform B region; direction of induced current and motional emf $\mathcal{E}=Blv$.

**Pitfalls.** Wrong sign from Lenz's rule.

**Quick checks.** What opposes the change? Induced current creates opposing field.

### 11.2 Time-Varying B Creates Curl in E

**Why it matters.** Connects electricity and magnetism dynamically.

**Key results.** Time-varying $B$ creates curl in $E$: $\nabla \times E=-\partial B/\partial t$. Lines of constant induced $E$ are loops.

**Worked example.** Changing solenoid current induces circular $E$ outside the solenoid.

**Pitfalls.** Forgetting that static fields don't create curl.

**Quick checks.** When does $\nabla \times E \neq 0$? Only when $B$ is changing.

### 11.3 Energy & Eddy Currents

**Why it matters.** Understanding losses and applications.

**Key results.** Induction heating, magnetic braking; minimizing losses with laminated cores.

**Worked example.** Calculate eddy current losses.

**Pitfalls.** Not accounting for resistance in energy calculations.

**Quick checks.** How to reduce eddy currents? Laminated cores.

## 12) Inductors, LR & LC

### 12.1 Inductance & Energy in Magnetic Fields

**Why it matters.** Inductors store energy in magnetic fields.

**Key results.** $\Phi_B=LI$, energy $U=\frac{1}{2}LI^2$. Solenoid $L=\mu_0 n^2 A\ell$.

**Worked example.** Calculate inductance and stored energy.

**Pitfalls.** Confusing self vs mutual inductance.

**Quick checks.** Does longer solenoid increase or decrease inductance? Increase.

### 12.2 LR Transients

**Why it matters.** Inductors resist current changes, creating time-dependent behavior.

**Key results.** $i(t)=I_0(1-e^{-t/\tau_L})$ with $\tau_L=L/R$ for a step; discharging $i(t)=I_0e^{-t/\tau_L}$.

**Worked example.** Time to drop to 1%: $t \approx 4.6\tau_L$.

**Pitfalls.** Using wrong time constant.

**Quick checks.** What is LR time constant? $L/R$.

### 12.3 LC Oscillations (No Resistance)

**Why it matters.** Oscillations are fundamental in AC circuits and resonance.

**Key results.** Exchange of energy between capacitor and inductor: $\ddot{q}+\omega^2 q=0$ with $\omega=1/\sqrt{LC}$. Total energy constant; sinusoidal current and voltage with 90° phase shift.

**Pitfalls.** Forgetting phase relations; ignoring small R that damps oscillations (RLC).

**Quick checks.** What is oscillation frequency? $\omega=1/\sqrt{LC}$.

