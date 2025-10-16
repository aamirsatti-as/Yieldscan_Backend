from django.db import migrations
from cards.models import Grade
def add_raw_grade(apps, schema_editor):
    Grade.objects.get_or_create(
        value='Raw',
        description=''
    )
def remove_raw_grade(apps, schema_editor):
    Grade.objects.filter(value='Raw').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0022_alter_collections_added_on'),
    ]

    operations = [
        migrations.RunPython(add_raw_grade,
            remove_raw_grade #It will reverse the migration in case you want to undo this migration
            ),
    ]