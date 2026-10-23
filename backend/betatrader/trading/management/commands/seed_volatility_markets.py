from django.core.management.base import BaseCommand
from trading.models import MarketType, Market

VOLATILITY_MARKETS = [
    {"name": "volatility-10-1s", "display_name": "Volatility 10 (1s) Index", "volatility_index": 10},
    {"name": "volatility-25-1s", "display_name": "Volatility 25 (1s) Index", "volatility_index": 25},
    {"name": "volatility-50-1s", "display_name": "Volatility 50 (1s) Index", "volatility_index": 50},
    {"name": "volatility-75-1s", "display_name": "Volatility 75 (1s) Index", "volatility_index": 75},
    {"name": "volatility-100-1s", "display_name": "Volatility 100 (1s) Index", "volatility_index": 100},
    {"name": "volatility-10", "display_name": "Volatility 10 Index", "volatility_index": 10},
    {"name": "volatility-25", "display_name": "Volatility 25 Index", "volatility_index": 25},
    {"name": "volatility-50", "display_name": "Volatility 50 Index", "volatility_index": 50},
    {"name": "volatility-75", "display_name": "Volatility 75 Index", "volatility_index": 75},
    {"name": "volatility-100", "display_name": "Volatility 100 Index", "volatility_index": 100},
    {"name": "volatility-15-1s", "display_name": "Volatility 15 (1s) Index", "volatility_index": 15},
    {"name": "volatility-30-1s", "display_name": "Volatility 30 (1s) Index", "volatility_index": 30},
    {"name": "volatility-90-1s", "display_name": "Volatility 90 (1s) Index", "volatility_index": 90},
    {"name": "volatility-150-1s", "display_name": "Volatility 150 (1s) Index", "volatility_index": 150},
    {"name": "volatility-250-1s", "display_name": "Volatility 250 (1s) Index", "volatility_index": 250},
]

BOOM_MARKETS = [
    {"name": "boom-300", "display_name": "Boom 300 Index", "volatility_index": 300},
    {"name": "boom-500", "display_name": "Boom 500 Index", "volatility_index": 500},
    {"name": "boom-1000", "display_name": "Boom 1000 Index", "volatility_index": 1000},
]

CRASH_MARKETS = [
    {"name": "crash-300", "display_name": "Crash 300 Index", "volatility_index": 300},
    {"name": "crash-500", "display_name": "Crash 500 Index", "volatility_index": 500},
    {"name": "crash-1000", "display_name": "Crash 1000 Index", "volatility_index": 1000},
]

class Command(BaseCommand):
    help = "Seed all Deriv synthetic markets (Volatility, Boom, Crash) into the database"

    def handle(self, *args, **options):
        # Volatility MarketType
        vol_type, created = MarketType.objects.get_or_create(
            name="Volatility",
            defaults={"profit_multiplier": 1.85}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created MarketType: {vol_type.name}"))
        else:
            self.stdout.write(f"MarketType exists: {vol_type.name}")

        # Boom MarketType
        boom_type, created = MarketType.objects.get_or_create(
            name="Boom",
            defaults={"profit_multiplier": 1.85}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created MarketType: {boom_type.name}"))
        else:
            self.stdout.write(f"MarketType exists: {boom_type.name}")

        # Crash MarketType
        crash_type, created = MarketType.objects.get_or_create(
            name="Crash",
            defaults={"profit_multiplier": 1.85}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created MarketType: {crash_type.name}"))
        else:
            self.stdout.write(f"MarketType exists: {crash_type.name}")

        created_count = 0

        # Seed Volatility
        self.stdout.write("\n--- Volatility Markets ---")
        for m in VOLATILITY_MARKETS:
            market, was_created = Market.objects.get_or_create(
                name=m["name"],
                defaults={
                    "market_type": vol_type,
                    "display_name": m["display_name"],
                    "volatility_index": m["volatility_index"],
                }
            )
            if was_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {m['display_name']}"))
            else:
                self.stdout.write(f"  Exists: {m['display_name']}")

        # Seed Boom
        self.stdout.write("\n--- Boom Markets ---")
        for m in BOOM_MARKETS:
            market, was_created = Market.objects.get_or_create(
                name=m["name"],
                defaults={
                    "market_type": boom_type,
                    "display_name": m["display_name"],
                    "volatility_index": m["volatility_index"],
                }
            )
            if was_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {m['display_name']}"))
            else:
                self.stdout.write(f"  Exists: {m['display_name']}")

        # Seed Crash
        self.stdout.write("\n--- Crash Markets ---")
        for m in CRASH_MARKETS:
            market, was_created = Market.objects.get_or_create(
                name=m["name"],
                defaults={
                    "market_type": crash_type,
                    "display_name": m["display_name"],
                    "volatility_index": m["volatility_index"],
                }
            )
            if was_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {m['display_name']}"))
            else:
                self.stdout.write(f"  Exists: {m['display_name']}")

        self.stdout.write(self.style.SUCCESS(f"\nDone. Created {created_count} new markets."))
