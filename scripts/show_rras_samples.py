import sys, os
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_root, 'backend'))
sys.path.insert(0, _root)
import replay_engine as re

re.full_reset('DEMO-001')
for tick in [0, 5, 10]:
    s = re.get_canonical_state('DEMO-001', tick)
    rras = s['rras']
    imp  = s['impact']
    pop = imp.get('total_exposed_population', 0)
    print(f"\n=== TICK T{tick} ===")
    print(f"  exposed_pop      : {pop:,}")
    print(f"  risk_level       : {imp.get('risk_level')}")
    print(f"  tti_hours        : {imp.get('time_to_impact_hours')}")
    print(f"  flood_index      : {imp.get('flood_risk_index')}")
    smry = rras.get('summary', {})
    rnet = rras.get('road_network', {})
    print(f"  districts_covered: {smry.get('districts_covered')}")
    print(f"  road_status      : {rnet.get('status_counts')}")
    res = smry.get('total_resources_mobilized', {})
    print(f"  food_units       : {res.get('food_units', 0):,}")
    print(f"  water_units      : {res.get('water_units', 0):,}")
    print(f"  med_kits         : {res.get('med_kits', 0):,}")
    print(f"  ndrf_teams       : {res.get('ndrf_teams', 0)}")
    plan = rras.get('allocation_plan', [])
    if plan:
        top = plan[0]
        print(f"  top_trip         : {top['depot_id']} -> {top['district']} | {top['total_km']}km | {top['access_status']}")
    else:
        print("  top_trip         : (no districts exposed)")
