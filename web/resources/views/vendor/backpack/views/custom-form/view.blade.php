<style>
    .section-container {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 25px 25px 15px 25px;
        margin-bottom: 25px;
        position: relative;
        background-color: #e6e6e63b;
    }

    .custom-form_controls-left {
        position: absolute;
        left: -12px;
    }

    .custom-form_controls-right {
        position: absolute;
        right: -12px;
    }

    .custom-form_controls-top {
        position: absolute;
        top: -12px;
        display: flex;
    }

    .custom-form_controls-top div {
        margin-right: 5px;
    }

    .custom-form_controls-button {
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 50%;
        margin-bottom: 2px;
        overflow: hidden;
        border-width: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .lines-section {
        margin-top: 25px;
    }

    .line-container {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 30px 30px 15px 30px;
        margin-bottom: 25px;
        position: relative;
        background-color: #e6e6e652;
    }


    .input-container {
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        position: relative;
        padding-right: 15px;
        padding-left: 15px;
        padding-top: 10px;
        background-color: #e6e6e6;
        min-height: 95px;
    }

    .icon-8 {
        font-size: 10px;
    }

    .control-border {
        border: 1px solid grey;
    }

    .line-design-container {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 30px 5px 30px 5px;
        margin-bottom: 25px;
        position: relative;
        background-color: #e6e6e652;
    }

    .line-design-container_item {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 30px 30px 15px 30px;
        position: relative;
        background-color: #0c91ff40;
    }

    .line-design-container-grid-1 {
        display: grid;
        grid-template-columns: 1fr;
    }

    .line-design-container-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
    }

    .line-design-container-grid-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 5px;
    }

    .line-design-container-grid-4 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 5px;
    }
</style>
@php
    function getTextTrans($text)
    {
        $lang = app()->getLocale();
        return $text[$lang] ?? null;
    }
@endphp
@include('vendor.backpack.views.custom-form.components.modals.modal-section')
@include('vendor.backpack.views.custom-form.components.modals.modal-input')
@include('vendor.backpack.views.custom-form.components.modals.modal-line')
@foreach ($request->form_sections as $section)
    @include('vendor.backpack.views.custom-form.components.container-section', [
        'section' => $section,
    ])
@endforeach
<button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modalSection"
    data-order="{{ count($request->form_sections) + 1 }}">
    + {{ trans('custom-form.add_section') }}
</button>
